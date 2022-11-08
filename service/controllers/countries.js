import { getAllActiveCountries } from "#queries/countries";

export const getAllCountries = async () => {
  return await getAllActiveCountries()
    .then((res) => {
      return res.rows;
    })
    .catch((err) => {
      throw err;
    });
};
