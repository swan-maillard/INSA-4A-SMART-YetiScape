import FirestoreDatabase from '../FirestoreDatabase';
import Game, { gameConverter, GameFirestore } from '../models/game';

const db = FirestoreDatabase;

export const getAllGames = async () => {
  const gamesFirestore = await db.getAll<GameFirestore>('games');
  return gamesFirestore.map((game) => gameConverter.fromFirestore(game));
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
