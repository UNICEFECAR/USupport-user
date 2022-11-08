import express from "express";

import { getAllLanguages } from "#controllers/languages";

const router = express.Router();

router.get("/", async (req, res, next) => {
  /**
   * #route   GET /user/v1/languages
   * #desc    Get all active languages
   */

  return await getAllLanguages()
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
