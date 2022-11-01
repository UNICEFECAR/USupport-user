import express from "express";
import formidable from "formidable";
import fs from "fs";

import { uploadFile } from "#controllers/uploadFile";

import { uploadFileSchema } from "#schemas/UploadFileSchema";

const router = express.Router();

router.route("/").post(async (req, res, next) => {
  /**
   * #route   POST /user/v1/file-upload/
   * #desc    Request to upload a file to AWS S3 bucket
   */
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    const filePath = files.fileContent?.filepath;

    const parsedForm = {
      fileName: fields.fileName,
      fileContent: filePath ? fs.readFileSync(filePath) : null,
    };

    return await uploadFileSchema
      .noUnknown(true)
      .strict()
      .validate(parsedForm)
      .then(uploadFile)
      .then((result) => res.json(result).status(204))
      .catch(next);
  });
});

export { router };
