import bcrypt from "bcryptjs";

import { getUserByID } from "#queries/users";
import { userNotFound } from "#utils/errors";
import { updatePassword } from "#utils/helperFunctions";

import { incorrectPassword } from "#utils/errors";

export const getSharedUserData = async ({ country, user_id }) => {
  return await getUserByID(country, user_id)
    .then((res) => {
      if (res.rowCount === 0) {
        throw userNotFound();
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const changeUserPassword = async ({
  user_id,
  oldPassword,
  newPassword,
}) => {
  const userData = await getSharedUserData({ user_id });
  const validatePassword = await bcrypt.compare(oldPassword, userData.password);

  if (!validatePassword) {
    throw incorrectPassword();
  }

  await updatePassword({ user_id, password: newPassword });

  return { success: true };
};
