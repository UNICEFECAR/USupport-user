import * as yup from "yup";
import { t } from "#translations/index";

export const refreshAccessTokenSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  refreshToken: yup.string().uuid().required(),
});

export const userLoginSchema = (language) =>
  yup.object().shape(
    {
      userType: yup.string().oneOf(["client", "provider"]).required(),
      password: yup.string().required(),
      email: yup.string().when("userAccessToken", {
        is: undefined,
        then: yup
          .string()
          .email()
          .required(t("email_or_access_token_required_error", language)),
      }),
      userAccessToken: yup.string().when("email", {
        is: undefined,
        then: yup
          .string()
          .required(t("email_or_access_token_required_error", language)),
      }),
      otp: yup.string().when("userType", {
        is: "provider",
        then: yup.string().length(4).required(),
      }),
      isMobile: yup.boolean().notRequired(),
    },
    ["userAccessToken", "email", "otp"]
  );

export const provider2FARequestSchema = yup.object().shape({
  password: yup.string().required(),
  email: yup.string().email().required(),
});

export const emailOTPSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  email: yup.string().email().required(),
});

export const validatePlatformPasswordSchema = yup.object().shape({
  language: yup.string().required(),
  platformPassword: yup.string().required(t("password_is_required_error")),
});
