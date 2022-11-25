import express from "express";

import {
  getAllCountries,
  getCountryByAlpha2Code,
  updateCountryMinMaxClientAge,
} from "#controllers/countries";

import {
  getCountryByAlpha2CodeSchema,
  updateCountryMinMaxClientAgeSchema,
} from "#schemas/countrySchemas";

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

router.put("/min-max-client-age", async (req, res, next) => {
  /**
   * #route   PUT /user/v1/countries/min-max-client-age
   * #desc    Update the country min and max client age
   */

  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  const payload = req.body;

  return await updateCountryMinMaxClientAgeSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country, language, ...payload })
    .then(updateCountryMinMaxClientAge)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
