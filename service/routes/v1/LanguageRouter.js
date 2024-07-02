import express from "express";

import { getAllActiveLanguages, getAllLanguages } from "#controllers/languages";

const router = express.Router();

router.get("/", async (req, res, next) => {
  /**
   * #route   GET /user/v1/languages
   * #desc    Get all active languages
   */

  const country = req.headers["x-country-alpha-2"];
  const forGlobal = req.query.forGlobal;

  return await getAllActiveLanguages({
    country,
    forGlobal,
  })
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/all", async (req, res, next) => {
  /**
   * #route   GET /user/v1/languages
   * #desc    Get all languages
   */

  return await getAllLanguages()
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
