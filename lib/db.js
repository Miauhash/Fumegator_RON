// /lib/db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Abre (ou cria) o banco SQLite
export async function openDB() {
  return open({
    filename: "./mydb.sqlite",
    driver: sqlite3.Database
  });
}

// Cria tabela se não existir
export async function initDB() {
  const db = await openDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      wallet TEXT PRIMARY KEY,
      balances TEXT,
      lastUpdate INTEGER
    )
  `);
}
