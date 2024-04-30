import FirestoreDatabase from '../FirestoreDatabase';
import Game, { GameAttributes } from '../models/game';

const db = FirestoreDatabase;

export const getAllGames = async () => {
  const gamesAttributes = await db.getAll<GameAttributes>('games');
  return gamesAttributes.map((attributes: GameAttributes) => Game.fromFirestore(attributes));
};

export const getGameById = async (id: string) => {
  const gameAttributes = await db.getOne<GameAttributes>('games', id);
  return gameAttributes ? Game.fromFirestore(gameAttributes) : null;
};

export const createGame = async (game: Game) => {
  return await db.create<Game>('games', game);
};

export const updateGame = async (game: Game) => {
  return await db.update<Game>('games', game);
};

export const deleteGame = async (id: string) => {
  return await db.delete('games', id);
};
