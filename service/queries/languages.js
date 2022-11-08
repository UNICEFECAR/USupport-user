import { masterPool } from "#utils/dbConfig";

export const getAllActiveLanguages = async () =>
  await masterPool.query(
    `
      SELECT * 
      FROM "language"
      WHERE "is_active" = true
      ORDER BY "name" DESC;
        
    `
  );
