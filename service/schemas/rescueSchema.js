import * as yup from "yup";

import { PASSWORD_REGEX } from "./userSchemas";

export const initForgotPasswordSchema = yup.object().shape({
  email: yup.string().email().required(),
});

export const resetForgotPasswordSchema = yup.object().shape({
  token: yup.string().required(),
  password: yup.string().matches(PASSWORD_REGEX).required(),
});
