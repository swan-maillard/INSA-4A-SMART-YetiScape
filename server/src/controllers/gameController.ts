import { Request, Response } from 'express';
import User from '../models/user';
import { createGame, deleteGame, getAllGames, getGameById, updateGame } from '../services/gamesServices';
import { createUser, deleteUserById, getUserByName, updateUser } from '../services/usersServices';
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
};
