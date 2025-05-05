import express from "express";

import {
  getActiveCountriesWithLanguages,
  getAllCountries,
  getCountryByAlpha2Code,
} from "#controllers/countries";

import { getCountryByAlpha2CodeSchema } from "#schemas/countrySchemas";

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

router.get("/by-alpha-2-code", async (req, res, next) => {
  /**
   * #route   GET /user/v1/countries/by-alpha-2-code
   * #desc    Get a specific country by its alpha-2 code
   */

  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  return await getCountryByAlpha2CodeSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, language })
    .then(getCountryByAlpha2Code)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get("/countries-with-languages", async (req, res, next) => {
  /**
   * #route   GET /user/v1/countries/countries-with-languages
   * #desc    Get all active countries with languages
   */

  console.log("Fetching all active countries with languages");

  return await getActiveCountriesWithLanguages()
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
