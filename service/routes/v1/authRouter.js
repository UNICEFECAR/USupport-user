import express from "express";
import passport from "passport";

import {
  issueAccessToken,
  issueRefreshToken,
  refreshAccessToken,
  generateAccessToken,
} from "#controllers/auth";

import { refreshAccessTokenSchema } from "#schemas/authSchemas";

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

    const accessToken = await issueAccessToken({ user_id: user.user_id });
    const refreshToken = await issueRefreshToken({
      country,
      user_id: user.user_id,
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

    const accessToken = await issueAccessToken({ user_id: user.user_id });
    const refreshToken = await issueRefreshToken({
      country,
      user_id: user.user_id,
    });

    const result = {
      user,
      token: { ...accessToken, refreshToken },
    };

    return res.status(200).send(result);
  }
);

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

export { router };
