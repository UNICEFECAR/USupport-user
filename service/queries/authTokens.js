import { getDBPool } from "#utils/dbConfig";

export const storeRefreshToken = async (poolCountry, user_id, refreshToken) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        INSERT INTO refresh_token (user_id, token, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '31 DAYS')
        RETURNING *;
    `,
    [user_id, refreshToken]
  );

export const getRefreshToken = async (poolCountry, token) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        SELECT * 
        FROM refresh_token
        WHERE token = $1
        ORDER BY created_at DESC
        LIMIT 1;
    `,
    [token]
  );

export const invalidateRefreshToken = async (poolCountry, token) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        UPDATE refresh_token
        SET used = true
        WHERE token = $1;
    `,
    [token]
  );
