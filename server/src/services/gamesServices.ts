import FirestoreDatabase from '../FirestoreDatabase';
import Game, { gameConverter, GameFirestore } from '../models/game';

const db = FirestoreDatabase;

export const getAllGames = async () => {
  const gamesFirestore = await db.getAll<GameFirestore>('games');
  return gamesFirestoreToGames(gamesFirestore);
};

export const getGameById = async (id: string) => {
  const gameFirestore = await db.getOne<GameFirestore>('games', id);
  return gameFirestore ? gameConverter.fromFirestore(gameFirestore) : null;
};

export const createGame = async (game: Game) => {
  game.id = await db.create<GameFirestore>('games', gameConverter.toFirestore(game));
  return game;
};

export const updateGame = async (game: Game) => {
  await db.update<GameFirestore>('games', gameConverter.toFirestore(game));
};

export const deleteGame = async (id: string) => {
  await db.delete('games', id);
};

const gamesFirestoreToGames = async (gamesFirestore: GameFirestore[]) => {
  return await Promise.all(gamesFirestore.map(async (game: GameFirestore) => await gameConverter.fromFirestore(game)));
};
