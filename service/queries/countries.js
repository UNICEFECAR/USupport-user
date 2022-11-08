import { masterPool } from "#utils/dbConfig";

export const getAllActiveCountries = async () =>
  await masterPool.query(
    `
      SELECT * 
      FROM "country"
      WHERE "is_active" = true
      ORDER BY "name" DESC
        
    `
  );
