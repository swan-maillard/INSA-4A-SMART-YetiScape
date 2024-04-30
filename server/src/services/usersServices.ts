import FirestoreDatabase from '../FirestoreDatabase';
import User, { userConverter, UserFirestore } from '../models/user';
import { gameConverter, GameFirestore } from '../models/game';

const db = FirestoreDatabase;

export const getAllUsers = async () => {
  const usersFirestore = await db.getAll<UserFirestore>('users');
  return await Promise.all(usersFirestore.map(async (user: UserFirestore) => await userConverter.fromFirestore(user)));
};

export const getUserById = async (id: string) => {
  const usersFirestore = await db.getOne<UserFirestore>('users', id);
  return usersFirestore ? userConverter.fromFirestore(usersFirestore) : null;
};

export const createUser = async (user: User) => {
  user.id = await db.create<UserFirestore>('users', userConverter.toFirestore(user));
  return user;
};

export const updateUser = async (user: User) => {
  await db.update<UserFirestore>('users', userConverter.toFirestore(user));
};

export const deleteUserById = async (id: string) => {
  await db.delete('users', id);
};
