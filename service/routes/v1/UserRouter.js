import express from "express";

import { getSharedUserData } from "#controllers/users";

import { securedRoute } from "#middlewares/auth";
import { getUserByIdSchema } from "#schemas/userSchemas";

const router = express.Router();

router.get("/", securedRoute, async (req, res) => {
  /**
   * #route   GET /user/v1/user
   * #desc    Get shared user data
   */
  const country = req.header("x-country-alpha-2");
  const user_id = req.user.user_id;

  return await getUserByIdSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, user_id })
    .then(getSharedUserData)
    .then((result) => res.status(200).send(result));
});

export { router };
