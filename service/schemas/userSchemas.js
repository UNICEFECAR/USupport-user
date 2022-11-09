import * as yup from "yup";
import { t } from "#translations/index";

export const PASSWORD_REGEX = new RegExp(
  "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"
);

export const getUserByIdSchema = yup.object().shape({
  country: yup.string().required(),
  user_id: yup.string().uuid().required(),
});

export const getUserByEmailSchema = yup.object().shape({
  email: yup.string().email().required(),
});

const sexTypeSchema = yup
  .string()
  .oneOf(["male", "female", "unspecified", "notMentioned"]);

const createClientSchema = (language) =>
  yup.object().shape(
    {
      name: yup.string().notRequired(),
      surname: yup.string().notRequired(),
      preferredName: yup.string().notRequired(),
      username: yup.string().notRequired(),
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
      image: yup.string().notRequired(),
      sex: sexTypeSchema.notRequired(),
      yob: yup.number().positive().notRequired(),
    },
    ["userAccessToken", "email"]
  );

const createProviderSchema = yup.object().shape({
  name: yup.string().required(),
  surname: yup.string().required(),
  preferredName: yup.string().required(),
  email: yup.string().email().required(),
  username: yup.string().notRequired(),
  patronym: yup.string().required(),
  phone: yup.string().notRequired(),
  phonePrefix: yup.string().notRequired(),
  image: yup.string().notRequired(),
  address: yup.string().notRequired(),
  video: yup.string().notRequired(),
  education: yup.string().notRequired(),
  sex: sexTypeSchema.notRequired(),
  consultationPrice: yup.number().positive().notRequired(),
  description: yup.string().notRequired(),
  workWith: yup.array().notRequired(),
});

export const createUserSchema = (language) =>
  yup.object().shape(
    {
      userType: yup.string().default("client"),
      countryID: yup.string().uuid().required(),
      password: yup
        .string()
        .matches(PASSWORD_REGEX)
        .required()
        .label(t("password_validation_error", language)),
      clientData: createClientSchema(language).when("userType", {
        is: "client",
        then: createClientSchema(language).required(),
      }),
      providerData: createProviderSchema.when("userType", {
        is: "provider",
        then: createProviderSchema.required(),
      }),
    },
    ["client", "provider"]
  );

export const changePasswordSchema = yup.object().shape({
  user_id: yup.string().uuid().required(),
  oldPassword: yup.string().required(),
  newPassword: yup.string().matches(PASSWORD_REGEX).required(),
});
