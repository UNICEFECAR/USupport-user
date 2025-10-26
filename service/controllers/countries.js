import {
  getAllActiveCountries,
  getCountriesWithLanguagesQuery,
  getCountryByAlpha2CodeQuery,
  addCountryEventQuery,
} from "#queries/countries";

import { countryNotFound } from "#utils/errors";

export const getAllCountries = async ({ platform }) => {
  return await getAllActiveCountries()
    .then((res) => {
      let countries = res.rows;
      if (platform !== "country-admin" && platform !== "website") {
        countries = countries.filter((x) => x.alpha2 !== "PS");
      }
      return countries;
    })
    .catch((err) => {
      throw err;
    });
};

export const getCountryByAlpha2Code = async ({ country, language }) => {
  return await getCountryByAlpha2CodeQuery({ country, language })
    .then((res) => {
      if (res.rowCount === 0) {
        throw countryNotFound(language);
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const getActiveCountriesWithLanguages = async ({ platform }) => {
  return await getCountriesWithLanguagesQuery()
    .then((res) => {
      if (!res.rows?.length) return [];

      let countries = res.rows;
      if (platform !== "country-admin") {
        countries = countries.filter((x) => x.alpha2 !== "PS");
      }
      return countries;
    })
    .catch((err) => {
      throw err;
    });
};

export const addCountryEvent = async ({
  country,
  language,
  eventType,
  clientDetailId,
  visitorId,
}) => {
  const countryId =
    eventType === "global_visit"
      ? null
      : await getCountryByAlpha2CodeQuery({
          country: country,
        }).then((res) => {
          if (res.rowCount === 0) {
            throw countryNotFound(language);
          }
          return res.rows[0].country_id;
        });

  return await addCountryEventQuery({
    countryId,
    eventType,
    clientDetailId,
    visitorId,
  })
    .then((res) => {
      if (res.rowCount > 0) return { success: true };
      return { success: false };
    })
    .catch((err) => {
      throw err;
    });
};
