import { getDBPool } from "#utils/dbConfig";

export const getAllActiveLanguages = async () =>
  await getDBPool("masterDb").query(
    `
      SELECT * 
      FROM "language"
      WHERE "is_active" = true
      ORDER BY "name" DESC;
        
    `
  );
