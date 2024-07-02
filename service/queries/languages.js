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

export const getAllLanguagesForCountry = async (country) => {
  return await getDBPool("masterDb").query(
    `
      SELECT DISTINCT "language".*
      FROM "language"
      INNER JOIN country_language_links cl ON cl."language_id" = "language"."language_id"
      INNER JOIN country c ON c."country_id" = cl."country_id"
      WHERE "language"."is_active" = true AND c."alpha2" = $1
      ORDER BY "language"."name" ASC;

      ;
    `,
    [country]
  );
};
