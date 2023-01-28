import { getDBPool } from "#utils/dbConfig";

export const storeAuthOTP = async (poolCountry, user_id, otp) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        INSERT INTO auth_otp (otp, user_id)
        VALUES ($1, $2)
        RETURNING *;
    `,
    [otp, user_id]
  );

export const getAuthOTP = async (poolCountry, otp, user_id) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        SELECT *
        FROM auth_otp
        WHERE otp = $1 
          AND user_id = $2
          AND used = false;
    `,
    [otp, user_id]
  );

export const getUserLastAuthOTP = async (poolCountry, user_id) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        SELECT *
        FROM auth_otp
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1;
    `,
    [user_id]
  );

export const changeOTPToUsed = async (poolCountry, otp_id) =>
  await getDBPool("piiDb", poolCountry).query(
    `
        UPDATE auth_otp
        SET used = true
        WHERE id = $1;
    `,
    [otp_id]
  );
