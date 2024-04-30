import FirestoreDatabase from '../FirestoreDatabase';
import User, { UserAttributes } from '../models/user';

const db = FirestoreDatabase;

export const getAllUsers = async () => {
  const usersAttributes = await db.getAll<UserAttributes>('users');
  return usersAttributes.map((attributes: UserAttributes) => User.fromFirestore(attributes));
};

export const getUserById = async (id: string) => {
  const userAttributes = await db.getOne<UserAttributes>('users', id);
  return userAttributes ? User.fromFirestore(userAttributes) : null;
};

export const createUser = async (user: User) => {
  return await db.create<User>('users', user);
};

export const deleteUserById = async (id: string) => {
  return await db.delete('users', id);
};
