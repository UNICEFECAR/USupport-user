import { getAllActiveLanguages } from "#queries/languages";

export const getAllLanguages = async () => {
  return await getAllActiveLanguages()
    .then((res) => {
      return res.rows;
    })
    .catch((err) => {
      throw err;
    });
};
