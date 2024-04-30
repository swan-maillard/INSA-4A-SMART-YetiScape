import { Router } from 'express';
import gameController from '../controllers/gameController';

const router = Router();

// Endpoints for /game/...

// GET /game/ displays the game session
router.get('/', gameController.getGame);

export default router;
