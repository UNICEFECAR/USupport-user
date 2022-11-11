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

export const getYearInMilliseconds = () => {
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;

  return year;
};
