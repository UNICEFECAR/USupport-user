import * as yup from "yup";

import { PASSWORD_REGEX } from "./userSchemas.js";

export const initForgotPasswordSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  email: yup.string().email().required(),
});

export const resetForgotPasswordSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  token: yup.string().required(),
  password: yup.string().matches(PASSWORD_REGEX).required(),
});
