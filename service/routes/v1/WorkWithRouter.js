import express from "express";

import { getAllWorkWith } from "#controllers/workWith";

import { getAllWorkWithSchema } from "#schemas/workWithSchemas";

const router = express.Router();

router.get("/", async (req, res, next) => {
  /**
   * #route   GET /user/v1/work-with
   * #desc    Get all work with areas
   */
  const country = req.header("x-country-alpha-2");
  return await getAllWorkWithSchema
    .noUnknown(true)
    .strict(true)
    .validate({ country })
    .then(getAllWorkWith)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
