import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// GB Database connection strings
const PII_DB_URL_GB = process.env.PII_DB_URL_GB;
const CLINICAL_DB_URL_GB = process.env.CLINICAL_DB_URL_GB;
const MASTER_DB_URL_GB = process.env.MASTER_DB_URL_GB;

// Add other DB connection strings here

export const getDBPool = (dbType, country) => {
  let currentConnString = null;

  switch (country) {
    // Add new countries here
    case "GB":
      if (dbType === "piiDb") currentConnString = PII_DB_URL_GB;
      else if (dbType === "clinicalDb") currentConnString = CLINICAL_DB_URL_GB;
      else if (dbType === "masterDb") currentConnString = MASTER_DB_URL_GB;
      else throw Error("DB Type not recognized");

      break;
    default:
      throw Error("DB Country not recognized");
  }

  return new pg.Pool({ connectionString: currentConnString });
};
