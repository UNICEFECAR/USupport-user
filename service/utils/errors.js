export const userNotFound = () => {
  const error = new Error();
  error.message = `User not found`;
  error.name = "USER NOT FOUND";
  error.status = 404;
  return error;
};

export const emailUsed = () => {
  const error = new Error();
  error.message = `This email is already used`;
  error.name = "EMAIL ALREADY USED";
  error.status = 409;
  return error;
};

export const userAccessTokenUsed = () => {
  const error = new Error();
  error.message = `This user access token is not available`;
  error.name = "USER ACCESS TOKEN ALREADY USED";
  error.status = 409;
  return error;
};

export const incorrectEmail = () => {
  const error = new Error();
  error.message = `There is no user with this email`;
  error.name = "INCORRECT EMAIl";
  error.status = 404;
  return error;
};

export const incorrectPassword = () => {
  const error = new Error();
  error.message = `There is no user with this password`;
  error.name = "INCORRECT PASSWORD";
  error.status = 404;
  return error;
};

export const notAuthenticated = () => {
  const error = new Error();
  error.message = `User needs to authenticate to access this resource`;
  error.name = "NOT AUTHENTICATED";
  error.status = 401;
  return error;
};

export const invalidRefreshToken = () => {
  const error = new Error();
  error.message = `Refresh token invalid or already used`;
  error.name = "REFRESH TOKEN NOT VALID";
  error.status = 401;
  return error;
};

export const cannotGenerateUserAccessToken = () => {
  const error = new Error();
  error.message = `Couldn't generate a new random user access token. Please try again`;
  error.name = "CANNOT GENERATE USER ACCESS TOKEN";
  error.status = 409;
  return error;
};

export const invalidResetPasswordToken = () => {
  const error = new Error();
  error.message = `Invalid or expired reset password token`;
  error.name = "INVALID RESET PASSWORD TOKEN";
  error.status = 409;
  return error;
};
