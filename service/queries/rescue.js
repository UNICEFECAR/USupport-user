import { pool } from "#utils/dbConfig";

export const storeForgotPasswordTokenQuery = async ({
  user_id,
  forgotPassToken,
}) =>
  await pool.query(
    `
        INSERT INTO password_reset (user_id, reset_token, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '1 DAY)
        RETURNING *;
    `,
    [user_id, forgotPassToken]
  );

export const getForgotPasswordTokenQuery = async ({ forgotPassToken }) =>
  await pool.query(
    `
          SELECT * 
          FROM password_reset
          WHERE reset_token = $1; 
      `,
    [forgotPassToken]
  );
