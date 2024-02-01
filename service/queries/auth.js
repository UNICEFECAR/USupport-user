import { getDBPool } from "#utils/dbConfig";

export const getPlatformPasswordQuery = async () => {
  return await getDBPool("masterDb").query(
    `
            SELECT *
            FROM platform_password;
        `
  );
};
