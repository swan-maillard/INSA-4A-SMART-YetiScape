import Database from '../SqliteDatabase';
import User, { userConverter, UserDatabase } from '../models/user';

const db = Database;

export const getAllUsers = async () => {
  const usersFirestore = await db.getAll<UserDatabase>('users');
  return usersFirestore.map((user) => userConverter.fromDatabase(user));
};

export const getUserById = async (id: string) => {
  const usersFirestore = await db.getOne<UserDatabase>('users', id);
  return usersFirestore ? userConverter.fromDatabase(usersFirestore) : null;
};

export const getUserByName = async (name: string) => {
  // FIRESTORE
  // const refUsers = db.getRef('users');
  // const q = query(refUsers, where('name', '==', name));
  // const usersFirestore = await db.getFromQuery<UserDatabase>(q);

  // SQLITE
  const q = 'SELECT * FROM users WHERE name = ?';
  const usersFirestore = await db.getFromQuery<UserDatabase>(q, [name]);
  return usersFirestore.length > 0 ? userConverter.fromDatabase(usersFirestore[0]) : null;
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
