import {
  getAllActiveCountries,
  getCountryByAlpha2CodeQuery,
  updateCountryMinMaxClientAgeQuery,
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

export const updateCountryMinMaxClientAge = async ({
  country,
  language,
  minClientAge,
  maxClientAge,
}) => {
  return await updateCountryMinMaxClientAgeQuery({
    country,
    language,
    minClientAge,
    maxClientAge,
  })
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
