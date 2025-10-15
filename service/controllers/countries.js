import {
  getAllActiveCountries,
  getCountriesWithLanguagesQuery,
  getCountryByAlpha2CodeQuery,
  addCountryEventQuery,
} from "#queries/countries";

import { countryNotFound } from "#utils/errors";

export const getAllCountries = async () => {
  return await getAllActiveCountries()
    .then((res) => {
      return res.rows;
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

export const getActiveCountriesWithLanguages = async () => {
  return await getCountriesWithLanguagesQuery()
    .then((res) => {
      return (
        res.rows?.map((x) => ({
          ...x,
        })) || []
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
}) => {
  const countryId = await getCountryByAlpha2CodeQuery({
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
  })
    .then((res) => {
      if (res.rowCount > 0) return { success: true };
      return { success: false };
    })
    .catch((err) => {
      throw err;
    });
};
