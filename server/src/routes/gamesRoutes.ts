import { Router } from 'express';
import userController from '../controllers/usersController';
import gamesController from '../controllers/gamesController';

const router = Router();

// Endpoints for /games/...
router.get('/', gamesController.getGames);
router.get('/:id', gamesController.getGameById);
router.post('/create', gamesController.createGame);
router.post('/join', gamesController.joinGame);
export default router;
