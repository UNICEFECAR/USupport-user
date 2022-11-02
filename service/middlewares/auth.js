import passport from "passport";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";
import bcrypt from "bcryptjs";

import {
  getUserByID,
  getClientUserByEmailOrAccessToken,
  getProviderUserByEmail,
  createUser,
} from "#queries/users";

import { createUserSchema } from "#schemas/userSchemas";
import { userLoginSchema } from "#schemas/authSchemas";

import {
  emailUsed,
  incorrectEmail,
  incorrectPassword,
  notAuthenticated,
  userNotFound,
  userAccessTokenUsed,
} from "#utils/errors";

const localStrategy = passportLocal.Strategy;
const jwtStrategy = passportJWT.Strategy;
const extractJWT = passportJWT.ExtractJwt;

const JWT_KEY = process.env.JWT_KEY;

passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "password",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, emailIn, passwordIn, done) => {
      try {
        const { countryID, password, userType, clientData, providerData } =
          await createUserSchema
            .noUnknown(true)
            .strict()
            .validate({
              password: passwordIn,
              ...req.body,
            })
            .catch((err) => {
              throw err;
            });

        let currentUser;
        console.log(userType);
        if (userType === "client") {
          currentUser = await getClientUserByEmailOrAccessToken(
            clientData.email,
            clientData.userAccessToken
          )
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        } else if (userType === "provider") {
          currentUser = await getProviderUserByEmail(providerData.email)
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        }
        console.log(currentUser);
        if (currentUser) {
          if (clientData?.email || providerData?.email) {
            return done(emailUsed());
          } else if (clientData.userAccessToken) {
            return done(userAccessTokenUsed());
          }
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);

        let newUser = await createUser({
          countryID,
          hashedPass,
          clientData,
          providerData,
        })
          .then((res) => res.rows[0])
          .catch((err) => {
            throw err;
          });

        // TODO: Send welcome email

        return done(null, newUser);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "password",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, emailIn, passwordIn, done) => {
      try {
        const { email, password, userAccessToken, userType } =
          await userLoginSchema
            .noUnknown(true)
            .strict()
            .validate({
              password: passwordIn,
              ...req.body,
            })
            .catch((err) => {
              throw err;
            });

        let user;
        if (userType === "client") {
          user = await getClientUserByEmailOrAccessToken(email, userAccessToken)
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        } else if (userType === "provider") {
          user = await getProviderUserByEmail(email)
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        }
        console.log(user);

        // const ip_address =
        //   req.header("X-Real-IP") || req.header("x-forwarded-for");

        if (!user) {
          return done(incorrectEmail());
        }

        const validatePassword = await bcrypt.compare(password, user.password);

        if (!validatePassword) {
          // TODO: Log login attempt

          return done(incorrectPassword());
        }

        // TODO: Log login attempt

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "jwt",
  new jwtStrategy(
    {
      jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_KEY,
      issuer: "online.usupport.userApi",
      audience: "online.usupport.app",
      algorithms: ["HS256"],
    },
    async (jwt_payload, done) => {
      try {
        const user_id = jwt_payload.sub;
        const user = await getUserByID(user_id)
          .then((res) => res.rows[0])
          .catch((err) => {
            throw err;
          });

        if (!user) {
          done(null, false);
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

export const authenticateJWT = (isMiddleWare, req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user) => {
    if (err || !user) {
      return next(notAuthenticated());
    }
    req.user = user;

    if (isMiddleWare) return next();
    else {
      return res.status(200).send(req.user);
    }
  })(req, res, next);
};

export const securedRoute = (req, res, next) => {
  return authenticateJWT(true, req, res, next);
};
