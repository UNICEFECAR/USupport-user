import express from "express";

import { getAppVersionStatus } from "#controllers/appVersion";

import { getAppVersionStatusSchema } from "#schemas/appVersionSchemas";

const router = express.Router();

router.get("/", async (req, res, next) => {
  /**
   * #route   GET /user/v1/app-version
   * #desc    Check if the mobile app needs an optional or forced update
   */
  const language = req.header("x-language-alpha-2");
  const { platform, version } = req.query;

  return await getAppVersionStatusSchema
    .noUnknown(true)
    .strict(true)
    .validate({ platform, version, language })
    .then(getAppVersionStatus)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

export { router };
