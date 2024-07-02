import {
  getAllLanguagesQuery,
  getAllActiveLanguagesQuery,
  getAllLanguagesForCountry,
} from "#queries/languages";

export const getAllActiveLanguages = async ({ country, forGlobal }) => {
  if (forGlobal) {
    return await getAllActiveLanguagesQuery()
      .then((res) => {
        return res.rows;
      })
      .catch((err) => {
        throw err;
      });
  } else {
    return await getAllLanguagesForCountry(country)
      .then((res) => {
        return res.rows;
      })
      .catch((err) => {
        throw err;
      });
  }
};

export const getAllLanguages = async () => {
  return await getAllLanguagesQuery()
    .then((res) => {
      return res.rows;
    })
    .catch((err) => {
      throw err;
    });
};
