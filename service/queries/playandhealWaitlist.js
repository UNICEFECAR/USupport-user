import { getDBPool } from "#utils/dbConfig";

/**
 * Insert a Play and Heal waiting-list signup.
 * A repeated email is ignored so the same person is stored once.
 */
export const addPlayAndHealWaitlistEntryQuery = async ({
  fullName,
  email,
  location,
  language,
}) =>
  await getDBPool("masterDb").query(
    `
      INSERT INTO playandheal_waitlist (full_name, email, location, language)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING playandheal_waitlist_id
    `,
    [fullName, email, location, language]
  );
