import { getDBPool } from "#utils/dbConfig";

export const getAllWorkWithQuery = async ({ country }) =>
  await getDBPool("piiDb", country).query(
    `
      SELECT work_with_id, topic
      FROM work_with
    `
  );
