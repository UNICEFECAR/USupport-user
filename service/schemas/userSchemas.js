import * as yup from "yup";

export const getUserByIdSchema = yup.object().shape({
  user_id: yup.string().uuid().required(),
});

export const getUserByEmailSchema = yup.object().shape({
  email: yup.string().email().required(),
});

const sexTypeSchema = yup
  .string()
  .oneOf(["male", "female", "unspecified", "notMentioned"]);

const createClientSchema = yup.object().shape(
  {
    name: yup.string().required(),
    surname: yup.string().required(),
    preferredName: yup.string().required(),
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

export const createUserSchema = yup.object().shape(
  {
    userType: yup.string().oneOf(["client", "provider"]).required(),
    countryID: yup.string().uuid().required(),
    password: yup.string().required(), // TODO: Add password regex
    clientData: createClientSchema.when("userType", {
      is: "client",
      then: createClientSchema.required(),
    }),
    providerData: createProviderSchema.when("userType", {
      is: "provider",
      then: createProviderSchema.required(),
    }),
  },
  ["client", "provider"]
);
