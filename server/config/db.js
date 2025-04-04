import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Database configuration
const poolOptions = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
};

const pool = new pg.Pool(poolOptions);

export default pool;
