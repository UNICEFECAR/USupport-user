import { getDBPool } from "#utils/dbConfig";

export const getAllLanguagesQuery = async () =>
  await getDBPool("masterDb").query(
    `
      SELECT * 
      FROM "language"
      ORDER BY "name" ASC;

    `
  );

export const getAllActiveLanguagesQuery = async () =>
  await getDBPool("masterDb").query(
    `
      SELECT * 
      FROM "language"
      WHERE "is_active" = true
      ORDER BY "name" ASC; 

    `
  );
