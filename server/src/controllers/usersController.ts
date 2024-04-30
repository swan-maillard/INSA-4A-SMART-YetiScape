import { Request, Response } from 'express';
import { getAllUsers, getUserById } from '../services/usersServices';

export default {
  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await getAllUsers();
      res.status(200).send(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).send('Internal server error');
    }
  },

  getUserById: async (req: Request, res: Response) => {
    try {
      const user = await getUserById(req.params.id);
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      console.error('Error getting user "' + req.params.id + '":', error);
      res.status(500).send('Internal server error');
    }
  },
};
