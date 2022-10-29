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

import {
  emailUsed,
  incorrectEmail,
  incorrectPassword,
  notAuthenticated,
  userNotFound,
} from "#utils/errors";

const localStrategy = passportLocal.Strategy;
const jwtStrategy = passportJWT.Strategy;
const extractJWT = passportJWT.ExtractJwt;

const JWT_KEY = process.env.JWT_KEY;

passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, emailIn, passwordIn, done) => {
      try {
        const {
          countryID,
          email,
          password,
          userType,
          clientData,
          providerData,
        } = await createUserSchema
          .noUnknown(true)
          .strict()
          .validate({
            email: emailIn,
            password: passwordIn,
            ...req.body,
          })
          .catch((err) => {
            throw err;
          });

        let userWithEmail;

        if (userType === "client") {
          userWithEmail = await getClientUserByEmailOrAccessToken(email, null)
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        } else if (userType === "provider") {
          userWithEmail = await getProviderUserByEmail(email)
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        }

        if (!userWithEmail) {
          return done(emailUsed());
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);

        let newUser;
        if (userType === "client") {
          newUser = await createUser({ countryID, hashedPass, clientData })
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        } else if (userType === "provider") {
          newUser = await createUser({ countryID, hashedPass, providerData })
            .then((res) => res.rows[0])
            .catch((err) => {
              throw err;
            });
        }

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
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = getClientUserByEmailOrAccessToken(email, null)
          .then((res) => res.rows[0])
          .catch((err) => {
            throw err;
          });

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

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  const user = await getUserByID(id)
    .then((res) => res.rows[0])
    .catch((err) => {
      throw err;
    });

  if (!user) {
    return done(userNotFound());
  }

  done(null, user);
});

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
