import { nanoid } from "nanoid";

import {
  getClientUserByEmailOrAccessToken,
  getProviderUserByEmail,
} from "#queries/users";
import {
  storeForgotPasswordTokenQuery,
  getForgotPasswordTokenQuery,
  invalidatePasswordResetTokenQuery,
} from "#queries/rescue";

import {
  updatePassword,
  getCountryLabelFromAlpha2,
} from "#utils/helperFunctions";
import { produceRaiseNotification } from "#utils/kafkaProducers";

import { invalidResetPasswordToken } from "#utils/errors";

export const sendForgotPasswordEmail = async ({
  country,
  language,
  email,
  type,
}) => {
  let user = null;

  const countryLabel = getCountryLabelFromAlpha2(country);

  if (type === "client") {
    user = await getClientUserByEmailOrAccessToken(country, email)
      .then((raw) => {
        if (raw.rowCount === 0) {
          return null;
        } else {
          return raw.rows[0];
        }
      })
      .catch((err) => {
        throw err;
      });
  } else if (type === "provider") {
    user = await getProviderUserByEmail(country, email)
      .then((raw) => {
        if (raw.rowCount === 0) {
          return null;
        } else {
          return raw.rows[0];
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  if (!user) return { success: true };

  const forgotPasswordToken = nanoid(16);

  await storeForgotPasswordTokenQuery({
    poolCountry: country,
    user_id: user.user_id,
    forgotPassToken: forgotPasswordToken,
  });

  produceRaiseNotification({
    channels: ["email"],
    emailArgs: {
      emailType: "forgotPassword",
      recipientEmail: email,
      data: {
        forgotPasswordToken,
        platform: type,
        countryLabel,
      },
    },
    language,
  }).catch(console.log);

  return { success: true };
};

export const resetForgotPassword = async ({
  country,
  language,
  token,
  password,
}) => {
  const tokenData = await getForgotPasswordTokenQuery({
    poolCountry: country,
    forgotPassToken: token,
  })
    .then((raw) => raw.rows[0])
    .catch((err) => {
      throw err;
    });

  const now = new Date().getTime();
  const tokenExpiresIn = new Date(tokenData?.expires_at).getTime();

  if (!tokenData || tokenExpiresIn < now || tokenData.used) {
    throw invalidResetPasswordToken(language);
  }

  await updatePassword({
    poolCountry: country,
    user_id: tokenData.user_id,
    password,
  });

  await invalidatePasswordResetTokenQuery({ poolCountry: country, token });

  return { success: true };
};
