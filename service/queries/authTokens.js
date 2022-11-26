import { getDBPool } from "#utils/dbConfig";

export const storeRefreshToken = async (
  poolCountry,
  user_id,
  refreshToken,
  expiryInterval
) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        INSERT INTO refresh_token (user_id, token, expires_at)
        VALUES ($1, $2, NOW() + $3 * INTERVAL '1 MINUTE')
        RETURNING *;
    `,
    [user_id, refreshToken, expiryInterval]
  );

export const getRefreshToken = async (poolCountry, token) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        SELECT "refresh_token".user_id, expires_at, used, "user".type as user_type
        FROM refresh_token
          JOIN "user" ON "user".user_id = refresh_token.user_id
        WHERE token = $1
        ORDER BY "refresh_token".created_at DESC
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
