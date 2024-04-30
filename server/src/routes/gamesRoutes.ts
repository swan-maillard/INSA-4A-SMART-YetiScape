import { Router } from 'express';
import gamesController from '../controllers/gamesController';

const router = Router();

// Endpoints for /games/...
router.get('/', gamesController.getGames);
router.get('/:id', gamesController.getGameById);
router.post('/create', gamesController.createGame);
router.post('/join', gamesController.joinGame);
router.post('/delete', gamesController.deleteGame);
export default router;
