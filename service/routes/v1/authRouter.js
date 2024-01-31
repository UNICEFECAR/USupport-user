import express from "express";
import passport from "passport";
import fetch from "node-fetch";

import {
  issueAccessToken,
  issueTmpAccessToken,
  issueRefreshToken,
  refreshAccessToken,
  generateAccessToken,
  createEmailOTP,
  validatePlatformPassword,
} from "#controllers/auth";

import {
  emailOTPSchema,
  refreshAccessTokenSchema,
  validatePlatformPasswordSchema,
} from "#schemas/authSchemas";

const router = express.Router();

router.post(
  "/signup",
  passport.authenticate("signup", { session: false }),
  async (req, res) => {
    /**
     * #route   POST /user/v1/auth/signup
     * #desc    Create a new user and create a JWT session
     */
    const country = req.header("x-country-alpha-2");
    const user = req.user;
    const isMobile = req.body.isMobile;

    const accessToken = await issueAccessToken({
      user_id: user.user_id,
      userType: user.type,
      isMobile,
    });
    const refreshToken = await issueRefreshToken({
      country,
      user_id: user.user_id,
      userType: user.type,
    });

    const result = {
      user,
      token: { ...accessToken, refreshToken },
    };

    return res.status(200).send(result);
  }
);

router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  async (req, res) => {
    /**
     * #route   POST /user/v1/auth/login
     * #desc    Login a user using JWT token
     */
    const country = req.header("x-country-alpha-2");
    const user = req.user;
    const isMobile = req.body.isMobile;

    const accessToken = await issueAccessToken({
      user_id: user.user_id,
      userType: user.type,
      isMobile,
    });
    const refreshToken = await issueRefreshToken({
      country,
      user_id: user.user_id,
      userType: user.type,
    });

    const result = {
      user,
      token: { ...accessToken, refreshToken },
    };

    return res.status(200).send(result);
  }
);

router.post("/tmp-login", async (req, res) => {
  /**
   * #route   POST /user/v1/auth/tmp-login
   * #desc    Temporrary login a client using JWT token
   */
  const tmpAccessToken = await issueTmpAccessToken();
  const refreshToken = "tmp-refresh-token";

  const result = {
    token: { ...tmpAccessToken, refreshToken, userType: "client" },
  };

  return res.status(200).send(result);
});

router.get("/user-access-token", async (req, res, next) => {
  /**
   * #route   GET /user/v1/auth/user-access-token
   * #desc    Generate User Access token
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  return await generateAccessToken(country, language)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post("/refresh-token", async (req, res, next) => {
  /**
   * #route   POST /user/v1/auth/refresh-token
   * #desc    Refresh access token
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const payload = req.body;

  return await refreshAccessTokenSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language, ...payload })
    .then(refreshAccessToken)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post(
  "/2fa",
  passport.authenticate("2fa-request", { session: false }),
  async (req, res) => {
    /**
     * #route   POST /user/v1/auth/2fa
     * #desc    Request 2fa OTP
     */

    return res.status(200).send(req.user);
  }
);

router.post("/email-otp", async (req, res, next) => {
  /**
   * #route   POST /user/v1/auth/email-otp
   * #desc    Request email OTP
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const payload = req.body;

  return await emailOTPSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language, ...payload })
    .then(createEmailOTP)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

// eslint-disable-next-line no-unused-vars
router.post("/validate-captcha", async (req, res, next) => {
  // Receive captcha token from client
  // Make request to google recaptcha api to validate the token
  // If valid, return 200

  const captchaToken = req.body.token;
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then((res) => res.json());
  if (response.success) {
    return res.status(200).send(true);
  } else {
    return res.status(400).send(false);
  }
});

router.post("/validate-platform-password", async (req, res, next) => {
  /**
   * #route   POST /user/v1/auth/validate-platform-password
   * #desc    Validate platform password
   */
  const language = req.header("x-language-alpha-2") || "en";
  const { platformPassword } = req.body;

  return await validatePlatformPasswordSchema
    .noUnknown(true)
    .strict()
    .validate({ platformPassword, language })
    .then(validatePlatformPassword)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
