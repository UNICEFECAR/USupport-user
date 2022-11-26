import { getDBPool } from "#utils/dbConfig";

export const getAllActiveCountries = async () =>
  await getDBPool("masterDb").query(
    `
      SELECT * 
      FROM "country"
      WHERE "is_active" = true
      ORDER BY "name" DESC
        
    `
  );

export const getCountryByAlpha2CodeQuery = async ({ country }) =>
  await getDBPool("masterDb").query(
    `
      SELECT * 
      FROM "country"
      WHERE "alpha2" = $1
      ORDER BY "name" DESC
      LIMIT 1;
    `,
    [country]
  );

export const updateCountryMinMaxClientAgeQuery = async ({
  country,
  minClientAge,
  maxClientAge,
}) =>
  await getDBPool("masterDb").query(
    `
      UPDATE "country"
      SET "min_client_age" = $2, "max_client_age" = $3
      WHERE "alpha2" = $1
      RETURNING *;
    `,
    [country, minClientAge, maxClientAge]
  );
