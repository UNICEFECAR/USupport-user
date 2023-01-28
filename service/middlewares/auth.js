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
  createProviderDetailWorkWithLink,
  createProviderDetailLanguageLink,
} from "#queries/users";
import {
  storeAuthOTP,
  getAuthOTP,
  getUserLastAuthOTP,
  changeOTPToUsed,
} from "#queries/authOTP";

import { createUserSchema } from "#schemas/userSchemas";
import {
  userLoginSchema,
  provider2FARequestSchema,
} from "#schemas/authSchemas";

import { generate4DigitCode, generatePassword } from "#utils/helperFunctions";

import {
  emailUsed,
  incorrectEmail,
  incorrectPassword,
  notAuthenticated,
  userAccessTokenUsed,
  invalidOTP,
  tooManyOTPRequests,
} from "#utils/errors";
import { produceRaiseNotification } from "#utils/kafkaProducers";

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

        const salt = await bcrypt.genSalt(12);
        let hashedPass, randomlyGeneratedPassword;

        if (userType === "client") {
          hashedPass = await bcrypt.hash(password, salt);

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
          randomlyGeneratedPassword = generatePassword(10);
          hashedPass = await bcrypt.hash(randomlyGeneratedPassword, salt);
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
            return done(emailUsed(language));
          } else if (clientData.userAccessToken) {
            return done(userAccessTokenUsed(language));
          }
        }

        let newUser = await createUser({
          poolCountry: country,
          countryID,
          hashedPass,
          clientData,
          providerData,
        })
          .then(async (res) => {
            if (userType === "provider") {
              if (providerData.workWithIds?.length > 0) {
                // loop through workWithIds and create a new row in the provider_detail_work_with_links table
                for (let i = 0; i < providerData.workWithIds.length; i++) {
                  await createProviderDetailWorkWithLink({
                    poolCountry: country,
                    providerDetailId: res.rows[0].provider_detail_id,
                    workWithId: providerData.workWithIds[i],
                  }).catch((err) => {
                    throw err;
                  });
                }
              }
              if (providerData.languageIds?.length > 0) {
                // loop through languageIds and create a new row in the provider_detail_language_links table
                for (let i = 0; i < providerData.languageIds.length; i++) {
                  await createProviderDetailLanguageLink({
                    poolCountry: country,
                    providerDetailId: res.rows[0].provider_detail_id,
                    languageId: providerData.languageIds[i],
                  }).catch((err) => {
                    throw err;
                  });
                }
              }
            }

            return res.rows[0];
          })
          .catch((err) => {
            throw err;
          });

        if (userType === "client" && newUser.email) {
          produceRaiseNotification({
            channels: ["email"],
            emailArgs: {
              emailType: "signupWelcome",
              recipientEmail: newUser.email,
              data: {
                username: newUser.nickname,
                platform: userType,
              },
            },
            language,
          }).catch(console.log);
        }

        if (userType === "provider" && newUser.email) {
          produceRaiseNotification({
            channels: ["email"],
            emailArgs: {
              emailType: "provider-registration",
              recipientEmail: newUser.email,
              data: {
                password: randomlyGeneratedPassword,
              },
            },
            language,
          }).catch(console.log);
        }

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
        const { email, password, userAccessToken, userType, otp } =
          await userLoginSchema(language)
            .noUnknown(true)
            .strict()
            .validate({ password: passwordIn, ...req.body })
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
          return done(incorrectEmail(language));
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
          return done(incorrectPassword(language));
        }

        if (userType === "provider") {
          const userOTP = await getAuthOTP(country, otp, user.user_id).then(
            (data) => data.rows[0]
          );

          if (userOTP === undefined) {
            // OTP not found or already used
            return done(invalidOTP(language));
          } else {
            const OTPCreatedAt = new Date(userOTP.created_at).getTime();
            const now = new Date().getTime();

            if ((OTPCreatedAt - now) / 1000 > 60 * 30) {
              // OTP is valid for 30 mins
              return done(invalidOTP(language));
            }
          }

          // each OTP can be used only once
          await changeOTPToUsed(country, userOTP.id).catch((err) => {
            throw err;
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "2fa-request",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, emailIn, passwordIn, done) => {
      try {
        const language = req.header("x-language-alpha-2");
        const country = req.header("x-country-alpha-2");

        const { email, password } = await provider2FARequestSchema
          .noUnknown(true)
          .strict()
          .validate({ ...req.body, email: emailIn, password: passwordIn })
          .catch((err) => {
            throw err;
          });

        const providerUser = await getProviderUserByEmail(country, email)
          .then((res) => res.rows[0])
          .catch((err) => {
            throw err;
          });

        if (!providerUser) {
          return done(incorrectEmail(language));
        }

        const validatePassword = await bcrypt.compare(
          password,
          providerUser.password
        );

        if (!validatePassword) {
          return done(incorrectPassword(language));
        }

        const userLastOTP = await getUserLastAuthOTP(
          country,
          providerUser.user_id
        )
          .then((data) => data.rows[0])
          .catch((err) => {
            throw err;
          });

        if (userLastOTP !== undefined) {
          const lastOTPTime = new Date(userLastOTP.created_at).getTime();
          const now = new Date().getTime();

          if ((now - lastOTPTime) / 1000 < 60) {
            // Users can request one OTP every 60 seconds
            throw tooManyOTPRequests();
          } else {
            // invalidate last OTP generated before generating a new one
            await changeOTPToUsed(country, userLastOTP.id).catch((err) => {
              throw err;
            });
          }
        }

        const otp = generate4DigitCode();
        await storeAuthOTP(country, providerUser.user_id, otp).catch((err) => {
          throw err;
        });

        produceRaiseNotification({
          channels: ["email"],
          emailArgs: {
            emailType: "login-2fa-request",
            recipientEmail: email,
            data: { otp },
          },
          language,
        }).catch(console.log);

        return done(null, { success: true });
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
    const language = req.header("x-language-alpha-2");

    if (err || !user) {
      return next(notAuthenticated(language));
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
