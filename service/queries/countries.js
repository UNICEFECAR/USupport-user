import { getDBPool } from "#utils/dbConfig";

export const getAllActiveCountries = async () =>
  await getDBPool("masterDb").query(
    `
      SELECT DISTINCT("country"."country_id"),
              "country"."name",
              "country"."alpha2",
              "country"."alpha3",
              "country"."is_active",
              "country"."min_client_age", 
              "country"."max_client_age",
              "currency"."currency_id", 
              "currency"."name" AS "currency_name",
              "currency"."code", 
              "currency"."symbol", 
              "currency"."min_price", 
              "country"."local_name" AS local_name
      FROM "country"
        INNER JOIN "country_currency_links" ON "country"."country_id" = "country_currency_links".country_id
        INNER JOIN "currency" ON "country_currency_links".currency_id = "currency".currency_id
      WHERE "country"."is_active" = true
      ORDER BY "country"."name" ASC
    `
  );

export const getCountryByAlpha2CodeQuery = async ({ country }) =>
  await getDBPool("masterDb").query(
    `
      SELECT * 
      FROM "country"
      WHERE "alpha2" = $1
      ORDER BY "name" ASC
      LIMIT 1;
    `,
    [country]
  );

export const getCountriesWithLanguagesQuery = async () => {
  return await getDBPool("masterDb").query(
    `
          SELECT 
              country.country_id,
              country.name,
              country.alpha2,
              country.alpha3,
              country.is_active,
              country.min_client_age, 
              country.max_client_age,
              currency.currency_id, 
              currency.name AS currency_name,
              currency.code, 
              currency.symbol, 
              currency.min_price, 
              country.local_name AS local_name,
              JSON_AGG(DISTINCT 
                  JSONB_BUILD_OBJECT(
                      'language_id', l.language_id,
                      'name', l.name,
                      'alpha2', l.alpha2,
                      'local_name', l.local_name
                  )
              ) FILTER (WHERE l.is_active) AS languages
          FROM country
          INNER JOIN country_currency_links ON country.country_id = country_currency_links.country_id
          INNER JOIN currency ON country_currency_links.currency_id = currency.currency_id
          LEFT JOIN country_language_links cl ON cl.country_id = country.country_id
          LEFT JOIN language l ON cl.language_id = l.language_id
          WHERE country.is_active = true
          GROUP BY country.country_id, currency.currency_id
          ORDER BY country.name ASC;
      `
  );
};
