import * as yup from "yup";

export const getAppVersionStatusSchema = yup.object().shape({
  platform: yup.string().oneOf(["ios", "android"]).required(),
  version: yup
    .string()
    .matches(/^\d+(\.\d+){0,2}$/)
    .required(),
  language: yup.string().required(),
});
