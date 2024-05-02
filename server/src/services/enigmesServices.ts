import FirestoreDatabase from '../FirestoreDatabase';
import Game, { gameConverter, GameFirestore } from '../models/game';
import Enigme, { enigmeConverter, EnigmeFirestore } from '../models/enigme';

const db = FirestoreDatabase;

export const getEnigmeById = async (id: string) => {
  const enigmeFirestore = await db.getOne<EnigmeFirestore>('enigmes', id);
  return enigmeFirestore ? enigmeConverter.fromFirestore(enigmeFirestore) : null;
};

export const createEnigme = async (enigme: Enigme) => {
  enigme.id = await db.create<EnigmeFirestore>('enigmes', enigmeConverter.toFirestore(enigme));
  return enigme;
};

export const updateEnigme = async (enigme: Enigme) => {
  await db.update<EnigmeFirestore>('enigmes', enigmeConverter.toFirestore(enigme));
};

export const deleteEnigme = async (id: string) => {
  await db.delete('enigmes', id);
};
