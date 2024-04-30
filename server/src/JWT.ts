import { NextFunction, Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';

const secretKey = 'hexagoose';

// Middleware to verify JWT token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.body['user'] = decoded as string; // Save decoded user information to request object
    next();
  });
};

export const signUserData = (userData: { [key: string]: string }) => {
  return sign(userData, secretKey);
};
