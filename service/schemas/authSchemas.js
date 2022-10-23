import * as yup from "yup";

export const refreshAccessTokenSchema = yup.object().shape({
  refreshToken: yup.string().uuid().required(),
});
