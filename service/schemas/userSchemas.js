import * as yup from "yup";
import { t } from "#translations/index";

export const PASSWORD_REGEX = new RegExp(
  "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"
);

export const getUserByIdSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  user_id: yup.string().uuid().required(),
});

const sexTypeSchema = yup
  .string()
  .oneOf(["male", "female", "unspecified", "notMentioned"]);

const specializationsTypeSchema = yup
  .array()
  .of(
    yup
      .string()
      .oneOf(["psychologist", "psychotherapist", "psychiatrist", "coach"])
  );
const urbanRuralTypeSchema = yup.string().oneOf(["urban", "rural"]);

const createClientSchema = (language) =>
  yup.object().shape(
    {
      name: yup.string().notRequired(),
      surname: yup.string().notRequired(),
      nickname: yup.string().required(t("nickname_required_error", language)),
      email: yup.string().when("userAccessToken", {
        is: undefined,
        then: yup
          .string()
          .email(t("valid_email", language))
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
      yearOfBirth: yup.number().positive().notRequired(),
      urbanRural: urbanRuralTypeSchema.notRequired(),
      isMobile: yup.boolean().notRequired(),
    },
    ["userAccessToken", "email"]
  );

const createProviderSchema = yup.object().shape({
  name: yup.string().required(),
  patronym: yup.string().notRequired(),
  surname: yup.string().required(),
  nickname: yup.string().notRequired(),
  email: yup
    .string()
    .email({
      tlds: { allow: false },
    })
    .required(),
  phone: yup.string().notRequired(),
  specializations: specializationsTypeSchema.notRequired(),
  street: yup.string().notRequired(),
  city: yup.string().notRequired(),
  postcode: yup.string().notRequired(),
  education: yup.array().of(yup.string()).notRequired(),
  sex: sexTypeSchema.notRequired(),
  consultationPrice: yup.number().min(0).notRequired(),
  description: yup.string().notRequired(),
  workWithIds: yup.array().of(yup.string().uuid()).notRequired(),
  languageIds: yup.array().of(yup.string().uuid()).notRequired(),
  organizationIds: yup.array().of(yup.string().uuid()).notRequired(),
  videoLink: yup.string().notRequired(),
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
      isMobile: yup.boolean().notRequired(),
    },
    ["client", "provider"]
  );

export const changePasswordSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  user_id: yup.string().uuid().required(),
  oldPassword: yup.string().required(),
  newPassword: yup.string().matches(PASSWORD_REGEX).required(),
});

export const getNotificationPreferencesSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  notification_preference_id: yup.string().uuid().required(),
  userType: yup.string().required(),
});

const consultationReminderMinValidation = yup.lazy((value) =>
  Array.isArray(value)
    ? yup.array().of(yup.number().positive().max(60).required())
    : yup.number().positive().max(60).required()
);

export const updateNotificationPreferencesSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  notification_preference_id: yup.string().uuid().required(),
  email: yup.boolean().required(),
  consultationReminder: yup.boolean().required(),
  consultationReminderMin: consultationReminderMinValidation,
  inPlatform: yup.boolean().required(),
  push: yup.boolean().required(),
});

export const getTwilioTokenSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  consultationId: yup.string().uuid().required(),
  userId: yup.string().uuid().required(),
});

export const addContactFormSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  email: yup.string().email().required(),
  subject: yup.string().required(),
  message: yup.string().required(),
  sentFrom: yup.string().oneOf(["website", "client", "provider"]).required(),
});

export const changeUserLanguageSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  user_id: yup.string().uuid().required(),
});

export const addPlatformAccessSchema = yup.object().shape({
  country: yup.string().required(),
  ipAddress: yup.string().required(),
  userId: yup.string().uuid().nullable(),
  platform: yup.string().required(),
});

export const getContentRatingsSchema = yup.object().shape({
  language: yup.string().required(),
  userId: yup.string().uuid().required(),
});

export const addContentRatingSchema = getContentRatingsSchema.shape({
  contentId: yup.number().required(),
  contentType: yup.string().oneOf(["article", "video", "podcast"]).required(),
  positive: yup.boolean().nullable(),
});

export const getRatingsForContentSchema = yup.object().shape({
  // make userId nullable
  userId: yup.string().nullable(),
  contentId: yup.number().required(),
  contentType: yup.string().oneOf(["article", "video", "podcast"]).required(),
});

export const generatePdfSchema = yup.object().shape({
  language: yup.string().required(),
  contentUrl: yup.string().required(),
  contentType: yup.string().oneOf(["article", "video", "podcast"]).required(),
  title: yup.string().notRequired(),
  imageUrl: yup.string().notRequired(),
});
