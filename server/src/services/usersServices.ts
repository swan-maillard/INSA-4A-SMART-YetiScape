import FirestoreDatabase from '../FirestoreDatabase';
import User from '../models/user';

const db = FirestoreDatabase;

export const getAllUsers = async () => {
  return await db.getAll<User>('users');
};

export const getUserById = async (id: string) => {
  return await db.getOne<User>('users', id);
};

export const createUser = async (user: User) => {
  return await db.create<User>('users', user);
};
