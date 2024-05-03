import { Request, Response } from 'express';
import User from '../models/user';
import { createGame, deleteGame, getAllGames, getGameById, updateGame } from '../services/gamesServices';
import { createUser, deleteUserById, getUserByName, updateUser } from '../services/usersServices';
import Game from '../models/game';
import { signUserData } from '../JWT';

export default {
  getGames: async (req: Request, res: Response) => {
    try {
      const games = await getAllGames();
      res.status(200).send(games);
    } catch (error) {
      console.error('Error getting games:', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  createGame: async (req: Request, res: Response) => {
    const { username } = req.body;

    if (!username) {
      return res.status(400).send({ message: '"username" is required' });
    }

    let user = null;
    try {
      if (await getUserByName(username)) {
        return res.status(409).send({ message: 'Username already taken' });
      }

      user = await createUser(new User(username));
      const game = await createGame(new Game(user));
      user.game = game.id;
      user.salle = 1;

      //Create the call for this room
      var Call = require('../models/call.js');
      var call = Call.create();

      game.callId = call.id;
      console.log(game);
      await updateGame(game);

      await updateUser(user);

      res.status(200).send({ game, token: signUserData({ userId: user.id, gameId: game.id, callId : call.id }) });
    } catch (error) {
      // Rollback user creation if game creation fails
      console.error('Error creating game:', error);
      res.status(500).send({ message: 'Internal server error' });

      if (user) {
        await deleteUserById(user.id);
      }
    }
  },

  joinGame: async (req: Request, res: Response) => {
    const { username, gameId } = req.body;

    if (!username || !gameId) {
      return res.status(400).send({ message: '"username" and "gameId" are required' });
    }

    let user = null;
    try {
      if (await getUserByName(username)) {
        return res.status(409).send({ message: 'Username already taken' });
      }

      user = await createUser(new User(username));
      const game = await getGameById(gameId);
      if (game) {
        if (game.users.length < 3) {
          game.users.push(user);
          user.game = game.id;
          user.salle = game.users.length;
          await updateGame(game);
          await updateUser(user);
          let callId = game.callId ? game.callId : ""
          res.status(200).send({ game, token: signUserData({ userId: user.id, gameId: game.id, callId }) });
        } else {
          await deleteUserById(user.id);
          res.status(403).send({ message: 'Game session ' + gameId + ' has already started' });
        }
      } else {
        await deleteUserById(user.id);
        res.status(404).send({ message: 'No game with id ' + gameId + ' was found' });
      }
    } catch (error) {
      console.error('Error joining game:', error);
      res.status(500).send({ message: 'Internal server error' });

      if (user) {
        await deleteUserById(user.id);
      }
    }
  },

  deleteGame: async (req: Request, res: Response) => {
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).send({ message: '"gameId" is required' });
    }

    try {
      await deleteGame(gameId);
      res.status(200).send({ message: 'Game with id ' + gameId + ' successfully deleted' });
    } catch (error) {
      // Rollback user creation if game creation fails
      console.error('Error deleting game:', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },
};
