import { getDBPool } from "#utils/dbConfig";

export const getAppVersionByPlatformQuery = async (platform) =>
  await getDBPool("masterDb").query(
    `
      SELECT *
      FROM "app_version"
      WHERE "platform" = $1
      LIMIT 1;
    `,
    [platform]
  );
