import { Request, Response } from 'express';
import User from '../models/user';
import { createGame, deleteGame, getAllGames, getGameById, updateGame } from '../services/gamesServices';
import { createUser, deleteUserById } from '../services/usersServices';
import Game from '../models/game';

export default {
  getGames: async (req: Request, res: Response) => {
    try {
      const games = await getAllGames();
      res.status(200).send(games);
    } catch (error) {
      console.error('Error getting games:', error);
      res.status(500).send('Internal server error');
    }
  },

  getGameById: async (req: Request, res: Response) => {
    try {
      const game = await getGameById(req.params.id);
      if (game) {
        res.status(200).send(game);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      console.error('Error getting game "' + req.params.id + '":', error);
      res.status(500).send('Internal server error');
    }
  },

  createGame: async (req: Request, res: Response) => {
    const { username } = req.body;

    if (!username) {
      return res.status(400).send('"username" is required');
    }

    let user = null;
    try {
      // TODO : Handle already existing username
      user = await createUser(new User(username));
      const game = await createGame(new Game(user));
      res.status(200).send(game);
    } catch (error) {
      // Rollback user creation if game creation fails
      console.error('Error creating game:', error);
      res.status(500).send('Internal server error');

      if (user) {
        await deleteUserById(user.id);
      }
    }
  },

  joinGame: async (req: Request, res: Response) => {
    const { username, gameId } = req.body;

    if (!username || !gameId) {
      return res.status(400).send('"username" and "gameId" are required');
    }

    let user = null;
    try {
      // TODO : Handle already existing username
      user = await createUser(new User(username));
      const game = await getGameById(gameId);
      if (game) {
        if (game.users.length < 3) {
          game.users.push(user.id);
          await updateGame(game);
          res.status(200).send(game);
        } else {
          await deleteUserById(user.id);
          res.status(400).send('The game with id "' + gameId + '" has already started');
        }
      } else {
        await deleteUserById(user.id);
        res.status(404).send('No game with id "' + gameId + '" was found');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      res.status(500).send('Internal server error');

      if (user) {
        await deleteUserById(user.id);
      }
    }
  },

  deleteGame: async (req: Request, res: Response) => {
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).send('"gameId" is required');
    }

    try {
      const game = await getGameById(gameId);

      if (game) {
        const usersId = game.users;
        usersId.forEach((userId: string) => deleteUserById(userId));
        await deleteGame(gameId);
        res.status(200).send('Game ' + gameId + ' deleted');
      } else {
        res.status(404).send('No game with id "' + gameId + '" was found');
      }
    } catch (error) {
      // Rollback user creation if game creation fails
      console.error('Error deleting game:', error);
      res.status(500).send('Internal server error');
    }
  },
};
