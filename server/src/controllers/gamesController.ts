import { Request, Response } from 'express';
import User from '../models/user';
import { createGame, getAllGames, getGameById, updateGame } from '../services/gamesServices';
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
    try {
      const bodyData = req.body;
      // TODO : Handle already existing username
      if (bodyData.username) {
        const user = await createUser(new User(bodyData.username));
        const game = await createGame(new Game(user));
        res.status(200).send(game);
      } else {
        res.status(400).send('"username" is required');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).send('Internal server error');
    }
  },

  joinGame: async (req: Request, res: Response) => {
    try {
      const bodyData = req.body;
      // TODO : Handle already existing username
      if (bodyData['username'] && bodyData['gameId']) {
        const user = await createUser(new User(bodyData['username']));
        const game = await getGameById(bodyData['gameId']);
        if (game) {
          if (game.users.length < 3) {
            game.users.push(user.id);
            await updateGame(game);
            res.status(200).send(game);
          } else {
            res.status(400).send('The game with id "' + bodyData['gameId'] + '" has already started');
          }
        } else {
          await deleteUserById(user.id);
          res.status(404).send('No game with id "' + bodyData['gameId'] + '" was found');
        }
      } else {
        res.status(400).send('"username" and "gameId" are required');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      res.status(500).send('Internal server error');
    }
  },
};
