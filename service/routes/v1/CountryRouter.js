import express from "express";

import { getAllCountries } from "#controllers/countries";

const router = express.Router();

router.get("/", async (req, res, next) => {
  /**
   * #route   GET /user/v1/countries
   * #desc    Get all active countries
   */

  return await getAllCountries()
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
