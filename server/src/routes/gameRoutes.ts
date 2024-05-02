import { Router } from 'express';
import gameController from '../controllers/gameController';

const router = Router();

// Endpoints for /game/...

// GET /game/ displays the game session
router.get('/', gameController.getGame);

// Main room
router.get('/salle', gameController.getGame);

// Puzzles
router.get('/tuyau', gameController.getGame); // Room 1 & 2
router.get('/trappe', gameController.getGame); // Room 1 & 3
router.get('/rouages', gameController.getGame); // Room 2
router.get('/coffre', gameController.getGame); // Room 3

export default router;
