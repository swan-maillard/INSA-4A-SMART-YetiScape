// service.ts

import AbstractDocument from '../models/AbstractDocument';
import { Database, open } from 'sqlite';
import { Database as SqliteDriver } from 'sqlite3';

export default class SqliteDatabase {
  private db?: Database<SqliteDriver>;

  constructor() {
    open({
      filename: './src/databases/sqlite.db', // SQLite database file
      driver: SqliteDriver,
    })
      .then(async (db: Database<SqliteDriver>) => {
        this.db = db;
        await this.db.exec(`
      CREATE TABLE IF NOT EXISTS games (
       id TEXT PRIMARY KEY,
        hasStarted BOOLEAN,
       users TEXT,  -- store as JSON string
       trappe TEXT,
       tuyau TEXT,
       coffre TEXT,
       rouages TEXT,
       portes TEXT,
       itemsDispo TEXT
      );
  `);
        await this.db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      salle INTEGER,
      game TEXT,
      items TEXT  -- store as JSON string
    );
  `);
        console.log('SQLite Database connected');
      })
      .catch((error) => {
        console.error('Failed to connect to SQLite database:', error);
      });
  }

  async getAll<T extends AbstractDocument>(collectionName: string): Promise<T[]> {
    return this.db!.all(`SELECT * FROM ${collectionName}`);
  }

  async getOne<T extends AbstractDocument>(collectionName: string, documentId: string): Promise<T | null> {
    const document = await this.db!.get(`SELECT * FROM ${collectionName} WHERE id = ?`, [documentId]);
    return document || null;
  }

  async create<T extends AbstractDocument>(collectionName: string, data: T) {
    data.id = new Date().getTime().toString();

    // Extract keys and values from the data object
    const keys = Object.keys(data).join(', ');
    const placeholders = Object.keys(data)
      .map(() => '?')
      .join(', ');

    // Construct the SQL query
    const sql = `INSERT INTO ${collectionName} (${keys}) VALUES (${placeholders})`;

    // Execute the SQL query
    const params = Object.values(data);
    await this.db!.run(sql, params);

    // Return the document ID
    return data.id;
  }

  async update<T extends AbstractDocument>(collectionName: string, data: T) {
    // Extract keys and values from the data object
    const keyValuePairs = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(', ');

    // Construct the SQL query
    const sql = `UPDATE ${collectionName} SET ${keyValuePairs} WHERE id = ?`;

    // Execute the SQL query
    const params = [...Object.values(data), data.id];
    await this.db!.run(sql, params);
  }

  async delete(collectionName: string, documentId: string) {
    await this.db!.run(`DELETE FROM ${collectionName} WHERE id = ?`, [documentId]);
  }

  async getFromQuery<T>(query: string, params: unknown[] = []): Promise<T[]> {
    return await this.db!.all(query, params);
  }
}
