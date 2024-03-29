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

export const incorrectCredentials = (language) => {
  const error = new Error();
  error.message = t("incorrect_credentials_error", language);
  error.name = "INVALID CREDENTIALS";
  error.status = 404;
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

export const invalidOTP = (language) => {
  const error = new Error();
  error.message = t("invalid_provider_otp_error", language);
  error.name = "INVALID OTP";
  error.status = 401;
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

export const notificationPreferencesNotFound = (language) => {
  const error = new Error();
  error.message = t("notification_preferences_not_found_error", language);
  error.name = "NOTIFICATION PREFERENCES NOT FOUND";
  error.status = 404;
  return error;
};

export const countryNotFound = (language) => {
  const error = new Error();
  error.message = t("country_not_found_error", language);
  error.name = "COUNTRY NOT FOUND";
  error.status = 404;
  return error;
};

export const tooManyOTPRequests = (language) => {
  const error = new Error();
  error.message = t("too_many_otp_requests_error", language);
  error.name = "TOO MANY OTP REQUESTS";
  error.status = 429;
  return error;
};

export const invalidEmailOTP = (language) => {
  const error = new Error();
  error.message = t("invalid_email_otp_error", language);
  error.name = "INVALID EMAIL OTP";
  error.status = 404;
  return error;
};

export const emailOTPExpired = (language) => {
  const error = new Error();
  error.message = t("email_otp_expired_error", language);
  error.name = "EMAIL OTP EXPIRED";
  error.status = 404;
  return error;
};

export const invalidPlatformPassword = (language) => {
  const error = new Error();
  error.message = t("invalid_platform_password_error", language);
  error.name = "INVALID PLATFORM PASSWORD";
  error.status = 404;
  return error;
};

export const noPlatformPasswordSet = (language) => {
  const error = new Error();
  error.message = t("no_platform_password_set_error", language);
  error.name = "NO PLATFORM PASSWORD SET";
  error.status = 404;
  return error;
};

class CustomError extends Error {
  constructor(message, name, status, customData) {
    super(message);
    this.name = name;
    this.status = status;
    this.customData = customData;
  }
}

export const tooManyLoginRequests = (language, remainingCooldownInSeconds) => {
  const error = new CustomError();
  error.message = t("too_many_login_requests_error", language, [
    (remainingCooldownInSeconds / 60).toFixed(0),
  ]);
  error.name = "TOO MANY LOGIN REQUESTS";
  error.customData = { remainingCooldownInSeconds };
  error.status = 429;
  return error;
};
