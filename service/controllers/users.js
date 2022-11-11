import bcrypt from "bcryptjs";

import {
  getUserByID,
  getNotificationPreferencesQuery,
  updateNotificationPreferencesQuery,
} from "#queries/users";
import { userNotFound, notificationPreferencesNotFound } from "#utils/errors";
import { updatePassword } from "#utils/helperFunctions";

import { incorrectPassword } from "#utils/errors";

export const getSharedUserData = async ({ country, language, user_id }) => {
  return await getUserByID(country, user_id)
    .then((res) => {
      if (res.rowCount === 0) {
        throw userNotFound(language);
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const changeUserPassword = async ({
  country,
  language,
  user_id,
  oldPassword,
  newPassword,
}) => {
  const userData = await getSharedUserData({ country, user_id });
  const validatePassword = await bcrypt.compare(oldPassword, userData.password);

  if (!validatePassword) {
    throw incorrectPassword(language);
  }

  await updatePassword({
    poolCountry: country,
    user_id,
    password: newPassword,
  });

  return { success: true };
};

export const getNotificationPreferences = async ({
  country,
  language,
  notification_preference_id,
}) => {
  return await getNotificationPreferencesQuery(
    country,
    notification_preference_id
  )
    .then((res) => {
      if (res.rowCount === 0) {
        throw notificationPreferencesNotFound(language);
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const updateNotificationPreferences = async ({
  country,
  language,
  notification_preference_id,
  email,
  consultation_reminder,
  consultation_reminder_min,
  in_platform,
  push,
}) => {
  return await updateNotificationPreferencesQuery({
    poolCountry: country,
    notification_preference_id,
    email,
    consultation_reminder,
    consultation_reminder_min,
    in_platform,
    push,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        throw notificationPreferencesNotFound(language);
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};
