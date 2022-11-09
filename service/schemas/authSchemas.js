import * as yup from "yup";
import { t } from "#translations/index";

export const refreshAccessTokenSchema = yup.object().shape({
  country: yup.string().required(),
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
    },
    ["userAccessToken", "email"]
  );
