import { Request, Response } from 'express';
import User from '../models/user';
import { createGame, deleteGame, getAllGames, getGameById, updateGame } from '../services/gamesServices';
import { createUser, deleteUserById, getUserById, getUserByName, updateUser } from '../services/usersServices';
import Game from '../models/game';
import { signUserData } from '../JWT';

export default {
  getGame: async (req: Request, res: Response) => {
    const { gameId } = req.body.jwt;

    try {
      const game = (await getGameById(gameId)) as Game;
      res.status(200).send(game);
    } catch (error) {
      console.error('Error getting game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  getRoom: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;

      switch (user.salle) {
        case 1:
          res.status(500).send(user);
          break;
        case 2:
          res.status(500).send(user);
          break;
        case 3:
          res.status(500).send(user);
          break;
      }
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },
};
