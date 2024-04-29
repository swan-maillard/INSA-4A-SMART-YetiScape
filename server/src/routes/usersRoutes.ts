import { Router } from 'express';
import userController from '../controllers/usersController';

const router = Router();

// Endpoints for /users/...
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);

export default router;
