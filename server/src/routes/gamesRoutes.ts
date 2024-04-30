import { Router } from 'express';
import gamesController from '../controllers/gamesController';

const router = Router();

// Endpoints for /games/...

// GET /games/ displays all game sessions
router.get('/', gamesController.getGames);

// GET /games/:id displays the game session with the given id
router.get('/:id', gamesController.getGameById);

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
