import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

// Neon memerlukan SSL. Tetapan ini selamat untuk kebanyakan hos terurus.
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("Ralat kolam PostgreSQL yang tidak dijangka:", err.message);
});

export const query = (text, params) => pool.query(text, params);
