import bcrypt from "bcryptjs";
import { updateUserPassword } from "#queries/users";

export const updatePassword = async ({ poolCountry, user_id, password }) => {
  const salt = await bcrypt.genSalt(12);
  const hashedPass = await bcrypt.hash(password, salt);

  await updateUserPassword({
    poolCountry,
    user_id,
    password: hashedPass,
  }).catch((err) => {
    throw err;
  });
};
