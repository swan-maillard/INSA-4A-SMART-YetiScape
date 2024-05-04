// service.ts

import AbstractDocument from './models/AbstractDocument';
import { Database, open } from 'sqlite';
import { Database as SqliteDatabase } from 'sqlite3';

// Initialize the SQLite database
let db: Database<SqliteDatabase>;
async function connectDatabase(): Promise<void> {
  db = await open({
    filename: './data.db', // SQLite database file
    driver: SqliteDatabase,
  });

  // Create tables if they don't exist
  await db.exec(`
      CREATE TABLE IF NOT EXISTS games (
       id TEXT PRIMARY KEY,
       users TEXT,  -- store as JSON string
       trappe TEXT,
       tuyau TEXT,
       coffre TEXT,
       rouages TEXT,
       portes TEXT,
       itemsDispo TEXT
      );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      salle INTEGER,
      game TEXT,
      items TEXT  -- store as JSON string
    );
  `);
}
connectDatabase()
  .then(() => {
    console.log('Database connected');
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
  });

export default {
  async getAll<T extends AbstractDocument>(collectionName: string): Promise<T[]> {
    return db.all(`SELECT * FROM ${collectionName}`);
  },

  async getOne<T extends AbstractDocument>(collectionName: string, documentId: string): Promise<T | null> {
    const document = await db.get(`SELECT * FROM ${collectionName} WHERE id = ?`, [documentId]);
    return document || null;
  },

  async create<T extends AbstractDocument>(collectionName: string, data: T) {
    // Extract keys and values from the data object
    const keys = Object.keys(data).join(', ');
    const placeholders = Object.keys(data)
      .map(() => '?')
      .join(', ');

    // Construct the SQL query
    const sql = `INSERT INTO ${collectionName} (${keys}) VALUES (${placeholders})`;

    // Execute the SQL query
    const params = Object.values(data);
    await db.run(sql, params);

    // Return the document ID
    return data.id;
  },

  async update<T extends AbstractDocument>(collectionName: string, data: T) {
    // Extract keys and values from the data object
    const keyValuePairs = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(', ');

    // Construct the SQL query
    const sql = `UPDATE ${collectionName} SET ${keyValuePairs} WHERE id = ?`;

    // Execute the SQL query
    const params = [...Object.values(data), data.id];
    await db.run(sql, params);
  },

  async delete(collectionName: string, documentId: string) {
    await db.run(`DELETE FROM ${collectionName} WHERE id = ?`, [documentId]);
  },
  async getFromQuery<T>(query: string, params: unknown[] = []): Promise<T[]> {
    return await db.all(query, params);
  },
};
