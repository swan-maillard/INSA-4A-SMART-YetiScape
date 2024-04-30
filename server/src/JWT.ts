import { NextFunction, Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { getUserById } from './services/usersServices';
import { getGameById } from './services/gamesServices';

const secretKey = 'hexagoose';

// Middleware to verify JWT token
export const verifyToken = (req: Request, res: Response) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.body.jwt = decoded as string; // Save decoded user information to request object
  });
};

export const checkAuthAccessGame = async (req: Request, res: Response, next: NextFunction) => {
  verifyToken(req, res);
  const { userId, gameId } = req.body.jwt;

  if (!gameId || !userId) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const game = await getGameById(gameId);
  const user = await getUserById(userId);
  if (!user || user.game?.id !== gameId || !game || !game.users.includes(userId)) {
    return res.status(401).json({ message: 'Access to this game session unauthorized' });
  }

  next();
};

export const signUserData = (userData: { [key: string]: string }) => {
  return sign(userData, secretKey);
};
