import express from "express";

import { getSharedUserData, changeUserPassword } from "#controllers/users";

import { securedRoute } from "#middlewares/auth";
import { getUserByIdSchema, changePasswordSchema } from "#schemas/userSchemas";

const router = express.Router();

router.get("/", securedRoute, async (req, res) => {
  /**
   * #route   GET /user/v1/user
   * #desc    Get shared user data
   */
  const user_id = req.user.user_id;

  return await getUserByIdSchema
    .noUnknown(true)
    .strict(true)
    .validate({ user_id })
    .then(getSharedUserData)
    .then((result) => res.status(200).send(result));
});

router.patch("/password", securedRoute, async (req, res) => {
  /**
   * #route   PATCH /user/v1/user/password
   * #desc    Update user's password
   */
  const user_id = req.user.user_id;
  const payload = req.body;

  return await changePasswordSchema
    .noUnknown(true)
    .strict(true)
    .validate({ user_id, ...payload })
    .then(changeUserPassword)
    .then((result) => res.status(200).send(result));
});

export { router };
