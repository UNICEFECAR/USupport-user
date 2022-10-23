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
