import passport from "passport";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";
import bcrypt from "bcryptjs";

import {
  getUserByID,
  getClientUserByEmailOrAccessToken,
  getProviderUserByEmail,
  createUser,
  loginAttempt,
} from "#queries/users";

import { createUserSchema } from "#schemas/userSchemas";
import { userLoginSchema } from "#schemas/authSchemas";

import {
  emailUsed,
  incorrectEmail,
  incorrectPassword,
  notAuthenticated,
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
      const language = req.header("x-language-alpha-2");

      try {
        const country = req.header("x-country-alpha-2");
        const { countryID, password, userType, clientData, providerData } =
          await createUserSchema(language)
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

        if (userType === "client") {
          currentUser = await getClientUserByEmailOrAccessToken(
            country,
            clientData.email,
            clientData.userAccessToken
          )
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        } else if (userType === "provider") {
          currentUser = await getProviderUserByEmail(
            country,
            providerData.email
          )
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        }

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
          poolCountry: country,
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
      const language = req.header("x-language-alpha-2");

      try {
        const country = req.header("x-country-alpha-2");
        const { email, password, userAccessToken, userType } =
          await userLoginSchema(language)
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
          user = await getClientUserByEmailOrAccessToken(
            country,
            email,
            userAccessToken
          )
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        } else if (userType === "provider") {
          user = await getProviderUserByEmail(country, email)
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        }

        if (!user) {
          return done(incorrectEmail());
        }

        const validatePassword = await bcrypt.compare(password, user.password);
        const ip_address =
          req.header("X-Real-IP") || req.header("x-forwarded-for") || "0.0.0.0";
        const location = req.header("x-location") || "Unknown";

        loginAttempt({
          poolCountry: country,
          user_id: user.user_id,
          ip_address,
          location,
          status: !validatePassword ? "failed" : "successful",
        });

        if (!validatePassword) {
          return done(incorrectPassword());
        }

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
      passReqToCallback: true,
    },
    async (req, jwt_payload, done) => {
      try {
        const country = req.header("x-country-alpha-2");
        const user_id = jwt_payload.sub;
        const user = await getUserByID(country, user_id)
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
