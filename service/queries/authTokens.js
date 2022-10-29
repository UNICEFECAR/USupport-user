import { pool } from "#utils/dbConfig";

export const storeRefreshToken = async (user_id, refreshToken) =>
  await pool.query(
    `
        INSERT INTO refresh_token (user_id, token)
        VALUES ($1, $2)
        RETURNING *;
    `,
    [user_id, refreshToken]
  );

export const getRefreshToken = async (token) =>
  await pool.query(
    `
        SELECT * 
        FROM refresh_token
        WHERE token = $1
        ORDER BY created_at DESC
        LIMIT 1;
    `,
    [token]
  );

export const invalidateRefreshToken = async (token) =>
  await pool.query(
    `
        UPDATE refresh_token
        SET used = true
        WHERE token = $1;
    `,
    [token]
  );
