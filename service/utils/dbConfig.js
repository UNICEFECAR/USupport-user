import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const PG_CONNECTION_STRING = process.env.PG_CONNECTION_STRING;

export const pool = new Pool({ connectionString: PG_CONNECTION_STRING });
