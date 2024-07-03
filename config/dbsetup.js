import pkg from "pg";
import argon from "argon2";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  query_timeout: 3400,
  connectionTimeoutMillis: 3500,
});

const hashedPassword = await argon.hash(process.env.HOD_PASSWORD);

async function main() {
  try {
    const modules = await pool.query(`
  `);

    console.log(modules.rows);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  } finally {
    await pool.end();
  }
}

await main();
