import { Request, Response } from 'express';
import { createUser, getAllUsers, getUserById } from '../services/usersServices';
import User from '../models/user';

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

  createUser: async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      if (userData.name && userData.password) {
        const user = new User(userData.name, userData.password);
        user.id = await createUser(user);
        res.status(200).send(user);
      } else {
        res.status(400).send('Name and password are required fields');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Internal server error');
    }
  },
};
