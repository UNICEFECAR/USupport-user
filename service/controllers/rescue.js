import { nanoid } from "nanoid";

import { getClientUserByEmailOrAccessToken } from "#queries/users";
import {
  storeForgotPasswordTokenQuery,
  getForgotPasswordTokenQuery,
  invalidatePasswordResetTokenQuery,
} from "#queries/rescue";

import { updatePassword } from "#utils/helperFunctions";

import { userNotFound, invalidResetPasswordToken } from "#utils/errors";

export const sendForgotPasswordEmail = async ({ country, email }) => {
  const clientUser = await getClientUserByEmailOrAccessToken(country, email)
    .then((raw) => {
      if (raw.rowCount === 0) {
        throw userNotFound();
      } else {
        return raw.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });

  const forgotPassToken = nanoid(16);

  await storeForgotPasswordTokenQuery({
    poolCountry: country,
    user_id: clientUser.user_id,
    forgotPassToken,
  });

  //   TODO: Send email with forgot pass token and don't return it in the request

  return { forgotPassToken };
};

export const resetForgotPassword = async ({ country, token, password }) => {
  const tokenData = await getForgotPasswordTokenQuery({
    poolCountry: country,
    forgotPassToken: token,
  })
    .then((raw) => raw.rows[0])
    .catch((err) => {
      throw err;
    });

  const now = new Date().getTime();
  const tokenExpiresIn = new Date(tokenData.expires_at).getTime();

  if (!tokenData || tokenExpiresIn < now || tokenData.used) {
    throw invalidResetPasswordToken();
  }

  await updatePassword({
    poolCountry: country,
    user_id: tokenData.user_id,
    password,
  });

  await invalidatePasswordResetTokenQuery({ poolCountry: country, token });

  return { success: true };
};
