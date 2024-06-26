import bcrypt from "bcryptjs";

import {
  getUserByID,
  getNotificationPreferencesQuery,
  updateNotificationPreferencesQuery,
  addContactFormQuery,
  changeUserLanguageQuery,
  addPlatformAccessQuery,
} from "#queries/users";
import {
  userNotFound,
  notificationPreferencesNotFound,
  incorrectPassword,
} from "#utils/errors";
import { updatePassword, videoToken } from "#utils/helperFunctions";

const TWILIO_CONFIG = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    apiSid: process.env.TWILIO_API_SID,
    apiSecret: process.env.TWILIO_API_SECRET,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
};

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
  userType,
}) => {
  return await getNotificationPreferencesQuery(
    country,
    notification_preference_id
  )
    .then((res) => {
      if (res.rowCount === 0) {
        throw notificationPreferencesNotFound(language);
      } else {
        if (userType !== "provider") {
          return {
            ...res.rows[0],
            consultation_reminder_min: res.rows[0].consultation_reminder_min[0],
          };
        }
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
  consultationReminder,
  consultationReminderMin,
  inPlatform,
  push,
}) => {
  const consultationReminderMinArray =
    typeof consultationReminderMin === "number"
      ? [consultationReminderMin]
      : consultationReminderMin;

  return await updateNotificationPreferencesQuery({
    poolCountry: country,
    notification_preference_id,
    email,
    consultationReminder,
    consultationReminderMin: consultationReminderMinArray,
    inPlatform,
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

export const getTwilioToken = async ({ userId, consultationId }) => {
  const token = videoToken(userId, consultationId, TWILIO_CONFIG);

  return { token: token.toJwt() };
};

export const addContactForm = async ({ country, ...payload }) => {
  return await addContactFormQuery({
    poolCountry: country,
    ...payload,
  })
    .then((res) => {
      if (res.rowCount > 0) return { success: true };

      return { success: false };
    })
    .catch((err) => {
      throw err;
    });
};

export const changeUserLanguage = async ({ country, language, user_id }) => {
  return await changeUserLanguageQuery({
    poolCountry: country,
    user_id,
    language,
  })
    .then((res) => {
      if (res.rowCount > 0) return { success: true };

      return { success: false };
    })
    .catch((err) => {
      throw err;
    });
};

export const addPlatformAccess = async ({
  country,
  userId,
  platform,
  ipAddress,
}) => {
  return await addPlatformAccessQuery({
    poolCountry: country,
    userId,
    platform,
    ipAddress,
  })
    .then((res) => {
      if (res.rowCount > 0) return { success: true };

      return { success: false };
    })
    .catch((err) => {
      throw err;
    });
};
