import {
  getAllActiveCountries,
  getCountriesWithLanguagesQuery,
  getCountryByAlpha2CodeQuery,
  addCountryEventQuery,
  getActiveCountriesArticlesQuery,
} from "#queries/countries";

import { countryNotFound } from "#utils/errors";
import {
  EVENT_COUNTRIES,
  isCountryListedOnPlatform,
} from "#utils/programCountries";

export const getAllCountries = async ({ platform }) => {
  return await getAllActiveCountries()
    .then((res) => {
      return res.rows.filter((x) =>
        isCountryListedOnPlatform(x.alpha2, platform)
      );
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

      return res.rows.filter((x) =>
        isCountryListedOnPlatform(x.alpha2, platform)
      );
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
  // Visits to the global website have no country
  const countryId =
    eventType === "global_visit"
      ? null
      : await getCountryByAlpha2CodeQuery({
          country: EVENT_COUNTRIES[eventType] || country,
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

export const getActiveCountriesArticles = async () => {
  return await getActiveCountriesArticlesQuery()
    .then((res) => {
      console.log("res", res.rows);
      return res.rows || [];
    })
    .catch((err) => {
      throw err;
    });
};
