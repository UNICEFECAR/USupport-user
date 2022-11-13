import { getAllWorkWithQuery } from "#queries/workWith";

export const getAllWorkWith = async ({ country }) => {
  return await getAllWorkWithQuery({ country })
    .then((res) => {
      return res.rows;
    })
    .catch((err) => {
      throw err;
    });
};
