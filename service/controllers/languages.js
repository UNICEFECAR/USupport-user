import {
  getAllLanguagesQuery,
  getAllActiveLanguagesQuery,
} from "#queries/languages";

export const getAllActiveLanguages = async () => {
  return await getAllActiveLanguagesQuery()
    .then((res) => {
      return res.rows;
    })
    .catch((err) => {
      throw err;
    });
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
