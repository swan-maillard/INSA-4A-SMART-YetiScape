import { Router } from 'express';
import gamesController from '../controllers/gamesController';
import { checkAuthAccessGame } from '../JWT';

const router = Router();

// Endpoints for /games/...

// GET /games/ displays all game sessions
router.get('/', gamesController.getGames);

router.get('/waiting-room/:id', gamesController.getWaitingRoom);

// POST /games/create allows a user to create a game session
// Params : 'username'
router.post('/create', gamesController.createGame);

// POST /games/join allows a user to join a game session
// Params : 'username', 'gameId'
router.post('/join', gamesController.joinGame);

// POST /games/delete to delete a game session
// Params : 'gameId'
router.post('/delete', gamesController.deleteGame);

export default router;
