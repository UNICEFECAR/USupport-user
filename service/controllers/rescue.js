import { nanoid } from "nanoid";

import { getClientUserByEmailOrAccessToken } from "#queries/users";
import {
  storeForgotPasswordTokenQuery,
  getForgotPasswordTokenQuery,
} from "#queries/rescue";

import { updatePassword } from "#utils/helperFunctions";

import { userNotFound, invalidResetPasswordToken } from "#utils/errors";

export const sendForgotPasswordEmail = async ({ email }) => {
  const clientUser = await getClientUserByEmailOrAccessToken(email)
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
    user_id: clientUser.user_id,
    forgotPassToken,
  });

  //   TODO: Send email with forgot pass token and don't return it in the request

  return { forgotPassToken };
};

export const resetForgotPassword = async ({ token, password }) => {
  const tokenData = await getForgotPasswordTokenQuery({
    forgotPassToken: token,
  })
    .then((raw) => raw.rows[0])
    .catch((err) => {
      throw err;
    });

  const now = new Date().getTime();
  const tokenExpiresIn = new Date(tokenData.expires_at).getTime();

  if (!tokenData || tokenExpiresIn < now) {
    throw invalidResetPasswordToken();
  }

  await updatePassword({ user_id: tokenData.user_id, password });
  //   TODO: Invalidate current token (DB schema needs to be updated)

  return { success: true };
};
