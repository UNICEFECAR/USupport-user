import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const USER_DB_URL = process.env.USER_DB_URL;

export const pool = new pg.Pool({ connectionString: USER_DB_URL });
