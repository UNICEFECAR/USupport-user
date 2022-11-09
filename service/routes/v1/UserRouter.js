import express from "express";

import { getSharedUserData, changeUserPassword } from "#controllers/users";

import { securedRoute } from "#middlewares/auth";
import { getUserByIdSchema, changePasswordSchema } from "#schemas/userSchemas";

const router = express.Router();

router.get("/", securedRoute, async (req, res, next) => {
  /**
   * #route   GET /user/v1/user
   * #desc    Get shared user data
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const user_id = req.user.user_id;

  return await getUserByIdSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, language, user_id })
    .then(getSharedUserData)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.patch("/password", securedRoute, async (req, res, next) => {
  /**
   * #route   PATCH /user/v1/user/password
   * #desc    Update user's password
   */
  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const user_id = req.user.user_id;
  const payload = req.body;

  return await changePasswordSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, language, user_id, ...payload })
    .then(changeUserPassword)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
