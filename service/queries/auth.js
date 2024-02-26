import { getDBPool } from "#utils/dbConfig";

export const getPlatformPasswordQuery = async () => {
  return await getDBPool("masterDb").query(
    `
            SELECT *
            FROM platform_password;
        `
  );
};

export const isJwtBlacklisted = async ({ token, poolCountry }) => {
  return await getDBPool("piiDb", poolCountry).query(
    `
            SELECT *
            FROM jwt_blacklist
            WHERE token = $1
            LIMIT 1;
        `,
    [token]
  );
};

export const logoutUserQuery = async ({ poolCountry, token }) => {
  return await getDBPool("piiDb", poolCountry).query(
    `
            INSERT INTO jwt_blacklist (token)
            VALUES ($1);
        `,
    [token]
  );
};

export const getFailedLoginAttempts = async ({ poolCountry, userId }) => {
  return await getDBPool("piiDb", poolCountry).query(
    `
            SELECT *
            FROM login_attempt
            WHERE user_id = $1 AND status = 'failed' AND created_at > NOW() - INTERVAL '1 hour'
            ORDER BY created_at DESC;
        `,
    [userId]
  );
};
