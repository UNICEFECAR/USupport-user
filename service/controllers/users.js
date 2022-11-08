import { getUserByID } from "#queries/users";

import { userNotFound } from "#utils/errors";

export const getSharedUserData = async ({ user_id }) => {
  return await getUserByID(user_id)
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
