import Game, { gameConverter, GameDatabase } from '../models/game';
import { deleteUserById } from './usersServices';
import { Item } from '../models/item';
import db from '../databases/db';

export const getAllGames = async () => {
  const gamesDatabase = await db.getAll<GameDatabase>('games');
  return gamesDatabaseToGames(gamesDatabase);
};

export const getGameById = async (id: string) => {
  const gameDatabase = await db.getOne<GameDatabase>('games', id);
  return gameDatabase ? gameConverter.fromDatabase(gameDatabase) : null;
};

export const createGame = async (game: Game) => {
  game.id = await db.create<GameDatabase>('games', gameConverter.toDatabase(game));
  return game;
};

export const updateGame = async (game: Game) => {
  await db.update<GameDatabase>('games', gameConverter.toDatabase(game));
};

export const deleteGame = async (id: string) => {
  const game = await getGameById(id);
  if (game) {
    game.users.forEach((user) => deleteUserById(user.id));
  }

  await db.delete('games', id);
};

export const removeItemFromRoom = async (gameId: string, room: number, item: Item) => {
  const game = await getGameById(gameId);

  if (game) {
    const indexItem = game.itemsDispo[room].indexOf(item);
    if (indexItem >= 0) {
      game.itemsDispo[room].splice(indexItem, 1);
      await updateGame(game);
    }
  }

  return game;
};

const gamesDatabaseToGames = async (gamesDatabase: GameDatabase[]) => {
  return await Promise.all(gamesDatabase.map(async (game: GameDatabase) => await gameConverter.fromDatabase(game)));
};
