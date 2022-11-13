import { getDBPool } from "#utils/dbConfig";

export const storeForgotPasswordTokenQuery = async ({
  poolCountry,
  user_id,
  forgotPassToken,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        INSERT INTO password_reset (user_id, reset_token, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '1 DAY')
        RETURNING *;
    `,
    [user_id, forgotPassToken]
  );

export const getForgotPasswordTokenQuery = async ({
  poolCountry,
  forgotPassToken,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      SELECT * 
      FROM password_reset
      WHERE reset_token = $1; 
    `,
    [forgotPassToken]
  );

export const invalidatePasswordResetTokenQuery = async ({
  poolCountry,
  token,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        UPDATE password_reset
        SET used = true
        WHERE reset_token = $1;
    `,
    [token]
  );
