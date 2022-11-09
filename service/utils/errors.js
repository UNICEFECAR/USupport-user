import { t } from "#translations/index";

export const userNotFound = (language) => {
  const error = new Error();
  error.message = t("user_not_found_error", language);
  error.name = "USER NOT FOUND";
  error.status = 404;
  return error;
};

export const emailUsed = (language) => {
  const error = new Error();
  error.message = t("email_already_used_error", language);
  error.name = "EMAIL ALREADY USED";
  error.status = 409;
  return error;
};

export const userAccessTokenUsed = (language) => {
  const error = new Error();
  error.message = t("user_access_token_already_used_error", language);
  error.name = "USER ACCESS TOKEN ALREADY USED";
  error.status = 409;
  return error;
};

export const incorrectEmail = (language) => {
  const error = new Error();
  error.message = t("incorrect_email_error", language);
  error.name = "INCORRECT EMAIl";
  error.status = 404;
  return error;
};

export const incorrectPassword = (language) => {
  const error = new Error();
  error.message = t("incorrect_password_error", language);
  error.name = "INCORRECT PASSWORD";
  error.status = 404;
  return error;
};

export const notAuthenticated = (language) => {
  const error = new Error();
  error.message = t("not_authenticated_error", language);
  error.name = "NOT AUTHENTICATED";
  error.status = 401;
  return error;
};

export const invalidRefreshToken = (language) => {
  const error = new Error();
  error.message = t("invalid_refresh_token_error", language);
  error.name = "REFRESH TOKEN NOT VALID";
  error.status = 401;
  return error;
};

export const cannotGenerateUserAccessToken = (language) => {
  const error = new Error();
  error.message = t("cannot_generate_user_access_token_error", language);
  error.name = "CANNOT GENERATE USER ACCESS TOKEN";
  error.status = 409;
  return error;
};

export const invalidResetPasswordToken = (language) => {
  const error = new Error();
  error.message = t("invalid_reset_password_token_error", language);
  error.name = "INVALID RESET PASSWORD TOKEN";
  error.status = 409;
  return error;
};
