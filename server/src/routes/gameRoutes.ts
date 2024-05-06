import { Router } from 'express';
import gameController from '../controllers/gameController';

const router = Router();

// Endpoints for /game/...

// GET /game/ displays the game session
router.get('/', gameController.getGame);

// Main room
router.get('/salle', gameController.getRoom);

router.post('/pick-item', gameController.pickItem);

// Puzzles
router.get('/tuyau', gameController.getTuyau); // Room 1 & 2
router.post('/tuyau/put-item', gameController.putItemTuyau); // Room 1
router.post('/tuyau/envoi', gameController.sendTuyau); // Room 1

router.get('/trappe', gameController.getTrappe); // Room 1 & 3
router.post('/trappe/get-item', gameController.getItemTrappe); // Room 1
router.post('/trappe/put-item', gameController.putItemTrappe); // Room 3
router.post('/trappe/solve', gameController.solveTrappe); // Room 3

router.get('/rouages', gameController.getRouages); // Room 2
router.post('/rouages/put-gear', gameController.putGearRouages); // Room 2
router.post('/rouages/remove-gear', gameController.removeGearRouages); // Room 2
router.post('/rouages/solve', gameController.solveRouages); // Room 2

router.get('/coffre', gameController.getCoffre); // Room 3
router.post('/coffre/solve', gameController.solveCoffre); // Room 3

router.post('/porte/put-item', gameController.putItemPorte);

export default router;
