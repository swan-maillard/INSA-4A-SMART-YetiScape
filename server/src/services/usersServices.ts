import User, { userConverter, UserDatabase } from '../models/user';
import db, { dbDriver } from '../databases/db';
import { query, where } from 'firebase/firestore';
import FirestoreDatabase from '../databases/FirestoreDatabase';
import SqliteDatabase from '../databases/SqliteDatabase';

export const getAllUsers = async () => {
  const usersDatabase = await db.getAll<UserDatabase>('users');
  return usersDatabase.map((user) => userConverter.fromDatabase(user));
};

export const getUserById = async (id: string) => {
  const usersDatabase = await db.getOne<UserDatabase>('users', id);
  return usersDatabase ? userConverter.fromDatabase(usersDatabase) : null;
};

export const getUserByName = async (name: string) => {
  let usersDatabase: UserDatabase[];
  let q;
  let customDb: FirestoreDatabase | SqliteDatabase;
  switch (dbDriver) {
    case 'firestore':
      customDb = db as FirestoreDatabase;
      q = query(customDb.getRef('users'), where('name', '==', name));
      usersDatabase = await customDb.getFromQuery<UserDatabase>(q);
      break;

    case 'sqlite':
      customDb = db as SqliteDatabase;
      q = 'SELECT * FROM users WHERE name = ?';
      usersDatabase = await customDb.getFromQuery<UserDatabase>(q, [name]);
      break;
  }
  return usersDatabase.length > 0 ? userConverter.fromDatabase(usersDatabase[0]) : null;
};

export const createUser = async (user: User) => {
  user.id = await db.create<UserDatabase>('users', userConverter.toDatabase(user));
  return user;
};

export const updateUser = async (user: User) => {
  await db.update<UserDatabase>('users', userConverter.toDatabase(user));
};

export const deleteUserById = async (id: string) => {
  await db.delete('users', id);
};
