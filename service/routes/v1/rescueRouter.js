import express from "express";

import {
  sendForgotPasswordEmail,
  resetForgotPassword,
} from "#controllers/rescue";

import {
  initForgotPasswordSchema,
  resetForgotPasswordSchema,
} from "#schemas/rescueSchema";

const router = express.Router();

router
  .route("/forgot-password")
  .get(async (req, res, next) => {
    /**
     * #route   GET /user/v1/rescue/forgot-password
     * #desc    Send forgot password email
     */
    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");

    const { email } = req.query;
    const { type } = req.query;

    return await initForgotPasswordSchema
      .noUnknown(true)
      .strict(true)
      .validate({ country, language, email, type })
      .then(sendForgotPasswordEmail)
      .then((result) => res.status(200).send(result))
      .catch(next);
  })
  .post(async (req, res, next) => {
    /**
     * #route   POST /user/v1/rescue/forgot-password
     * #desc    Reset forgot password with token
     */
    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");

    const payload = req.body;

    return await resetForgotPasswordSchema
      .noUnknown(true)
      .strict(true)
      .validate({ country, language, ...payload })
      .then(resetForgotPassword)
      .then((result) => res.status(200).send(result))
      .catch(next);
  });

export { router };
