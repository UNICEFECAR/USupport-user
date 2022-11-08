import * as yup from "yup";

export const refreshAccessTokenSchema = yup.object().shape({
  country: yup.string().required(),
  refreshToken: yup.string().uuid().required(),
});

export const userLoginSchema = yup.object().shape(
  {
    userType: yup.string().oneOf(["client", "provider"]).required(),
    password: yup.string().required(),
    email: yup.string().when("userAccessToken", {
      is: undefined,
      then: yup
        .string()
        .email()
        .required(
          "You need to provide either email or valid user access token to signup"
        ),
    }),
    userAccessToken: yup.string().when("email", {
      is: undefined,
      then: yup
        .string()
        .required(
          "You need to provide either email or valid user access token to signup"
        ),
    }),
  },
  ["userAccessToken", "email"]
);
