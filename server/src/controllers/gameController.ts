import { Request, Response } from 'express';
import User from '../models/user';
import { getGameById, removeItemFromRoom, updateGame } from '../services/gamesServices';
import { getUserById, updateUser } from '../services/usersServices';
import Game from '../models/game';
import { Item } from '../models/item';
import { Server } from 'socket.io';

const getSocketIo = (req: Request) => {
  return req.app.get('sockets') as {
    io: Server;
    socketSessions: { [key: string]: User };
  };
};

export default {
  getGame: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;

      res.status(200).send({ game, user });
    } catch (error) {
      console.error('Error getting game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  getRoom: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;

      let infos = {};
      if (user.salle === 1 || user.salle === 3) {
        infos = { ...infos, trappe: game.trappe };
      }

      if (user.salle === 1 || user.salle === 2) {
        infos = { ...infos, tuyau: game.tuyau };
      }

      if (user.salle === 3) {
        infos = { ...infos, coffre: game.coffre };
      }

      if (user.salle === 2) {
        infos = { ...infos, coffreRouage: game.rouages };
      }

      res.status(200).send({
        user,
        game: {
          id: game.id,
          itemsDispo: game.itemsDispo[user.salle!],
          hasStarted: game.hasStarted,
          ...infos,
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  pickItem: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      let game = (await getGameById(gameId)) as Game;

      const { item } = req.body;

      if (!item) {
        return res.status(400).send({ message: '"item" is required' });
      }

      // On check que l'item est disponible
      if (!game.itemsDispo[user.salle!].includes(item)) {
        return res.status(409).send({ message: 'Forbidden, this item cannot be picked' });
      }

      game = (await removeItemFromRoom(gameId, user.salle!, item)) as Game;
      user.items.push(item);
      await updateUser(user);

      res.status(200).send({
        status: 'ok',
        user,
        game: {
          itemsDispo: game.itemsDispo[user.salle!],
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  getTuyau: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 1 && salle !== 2) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      res.status(200).send({
        user,
        game: {
          tuyau: game.tuyau,
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  putItemTuyau: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 1) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const { item } = req.body;

      if (!item) {
        return res.status(400).send({ message: '"item" is required' });
      }

      // On check que l'utilisateur possède l'objet
      if (!user.items.includes(item)) {
        return res.status(409).send({ message: "Forbidden, you don't have this item" });
      }

      const tuyau = game.tuyau;

      // On check que le tuyau peut accueillir un item
      if (tuyau.etapeActuelle !== 0 || tuyau.items.length > 0) {
        return res.status(409).send({ message: 'Forbidden, there is already an item in the pipe' });
      }

      user.items.splice(user.items.indexOf(item), 1);
      tuyau.items.push(item);
      tuyau.etapeActuelle = 1;
      game.tuyau = tuyau;

      await updateUser(user);
      await updateGame(game);

      res.status(200).send({
        status: 'ok',
        user,
        game: {
          tuyau: tuyau,
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  sendTuyau: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 1) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const { trou } = req.body;

      if (!trou) {
        return res.status(400).send({ message: '"trou" is required' });
      }

      const tuyau = game.tuyau;

      if (tuyau.etapeActuelle > 1) {
        return res.status(409).send({ message: 'Forbidden, the pipe was already sent' });
      }

      // We check that it's the right hole and that it's the right item
      if (trou == 5 && tuyau.etapeActuelle === 1 && tuyau.items[0] === 'engrenageMoyen') {
        tuyau.etapeActuelle = 2;
        game.tuyau = tuyau;
        await updateGame(game);

        const { io, socketSessions } = getSocketIo(req);
        for (const [socketId, userSocket] of Object.entries(socketSessions)) {
          if (userSocket.game === game.id && userSocket.salle === 2) {
            io.to(socketId).emit('game/tuyau-arrived', { tuyau });
          }
        }

        res.status(200).send({
          status: 'ok',
          user,
          game: {
            tuyau: tuyau,
          },
        });
      } else {
        if (tuyau.etapeActuelle === 1) {
          const item = tuyau.items[0];
          tuyau.items = [];
          tuyau.etapeActuelle = 0;
          game.tuyau = tuyau;
          user.items.push(item);

          await updateGame(game);
          await updateUser(user);
        }

        res.status(200).send({
          status: 'no',
          user,
          game: {
            tuyau: tuyau,
          },
        });
      }
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  getItemTuyau: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 2) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const tuyau = game.tuyau;

      // On check que le joueur peut récupérer un item
      if (tuyau.etapeActuelle !== 2 || tuyau.items.length !== 1) {
        return res.status(409).send({ message: "Forbidden, you can't access any item" });
      }

      const item = tuyau.items[0];
      tuyau.items = [];
      game.tuyau = tuyau;
      user.items.push(item);

      await updateUser(user);
      await updateGame(game);

      res.status(200).send({
        status: 'ok',
        user,
        game: {
          tuyau: tuyau,
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  getTrappe: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 1 && salle !== 3) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      res.status(200).send({
        user,
        game: {
          trappe: game.trappe,
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  putItemTrappe: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 3) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const { item } = req.body;

      if (!item) {
        return res.status(400).send({ message: '"item" is required' });
      }

      // On check que l'utilisateur possède l'objet
      if (!user.items.includes(item)) {
        return res.status(409).send({ message: "Forbidden, you don't have this item" });
      }

      const trappe = game.trappe;

      // On check que le tuyau peut accueillir un item
      if (trappe.etapeActuelle == 0) {
        return res.status(409).send({ message: 'Forbidden, you have not solved this puzzle' });
      }

      if (<Item>item === 'gemmeTriangle') {
        user.items.splice(user.items.indexOf(item), 1);
        trappe.items.push(item);
        trappe.etapeActuelle = 1;
        game.trappe = trappe;

        await updateUser(user);
        await updateGame(game);

        const { io, socketSessions } = getSocketIo(req);
        for (const [socketId, userSocket] of Object.entries(socketSessions)) {
          if (userSocket.game === game.id && userSocket.salle === 1) {
            console.log('Socket emitted to ' + userSocket.name);
            io.to(socketId).emit('game/trappe-item-added', { trappe });
          }
        }

        res.status(200).send({
          status: 'ok',
          user,
          game: {
            trappe: trappe,
          },
        });
      } else {
        res.status(200).send({
          status: 'no',
          user,
          game: {
            trappe: trappe,
          },
        });
      }
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  getItemTrappe: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 1) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const trappe = game.trappe;

      // On check que le joueur peut récupérer un item
      if (trappe.etapeActuelle !== 1 || trappe.items.length !== 1) {
        return res.status(409).send({ message: "Forbidden, you can't access any item" });
      }

      const item = trappe.items[0];
      trappe.items = [];
      user.items.push(item);
      game.trappe = trappe;

      await updateUser(user);
      await updateGame(game);

      const { io, socketSessions } = getSocketIo(req);
      for (const [socketId, userSocket] of Object.entries(socketSessions)) {
        if (userSocket.game === game.id && userSocket.salle === 3) {
          io.to(socketId).emit('game/trappe-item-removed', { trappe });
        }
      }

      res.status(200).send({
        status: 'ok',
        user,
        game: {
          trappe: trappe,
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  solveTrappe: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 3) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const { configuration } = req.body;

      if (!configuration) {
        return res.status(400).send({ message: '"configuration" is required' });
      }

      const trappe = game.trappe;

      // On check que la trappe n'a pas été résolu
      if (trappe.etapeActuelle !== 0) {
        return res.status(409).send({ message: 'Forbidden, this puzzle has already been solved' });
      }

      const solution = '110000111001111';
      // On check que la configuration est correcte
      if (configuration == solution) {
        trappe.etapeActuelle = 1;
        game.trappe = trappe;

        await updateGame(game);

        const { io, socketSessions } = getSocketIo(req);
        for (const [socketId, userSocket] of Object.entries(socketSessions)) {
          if (userSocket.game === game.id && userSocket.salle === 1) {
            io.to(socketId).emit('game/trappe-opened', { trappe });
          }
        }

        res.status(200).send({
          status: 'ok',
          user,
          game: {
            trappe: trappe,
          },
        });
      } else {
        res.status(200).send({
          status: 'no',
          user,
          game: {
            trappe: trappe,
          },
        });
      }
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  getCoffre: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 3) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      res.status(200).send({
        user,
        game: {
          coffre: game.coffre,
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  solveCoffre: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 3) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const { code } = req.body;

      if (!code) {
        return res.status(400).send({ message: '"code" is required' });
      }

      const coffre = game.coffre;

      // On check que les rouages n'ont pas été résolu
      if (coffre.etapeActuelle !== 0) {
        return res.status(409).send({ message: 'Forbidden, this puzzle has already been solved' });
      }

      // On check que la position est correcte
      if (code == 8163) {
        coffre.etapeActuelle = 1;
        game.coffre = coffre;
        game.itemsDispo[user.salle!].push('gemmeCarre', 'gemmeTriangle');

        await updateGame(game);

        res.status(200).send({
          status: 'ok',
          user,
          game: {
            itemsDispo: game.itemsDispo[user.salle!],
            coffre: coffre,
          },
        });
      } else {
        res.status(200).send({
          status: 'no',
          user,
          game: {
            coffre: coffre,
          },
        });
      }
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  getRouages: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 2) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      res.status(200).send({
        user,
        game: {
          rouages: game.rouages,
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  putGearRouages: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 2) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const { item } = req.body;

      if (!item) {
        return res.status(400).send({ message: '"item" is required' });
      }

      const rouages = game.rouages;

      // On check que les rouages n'ont pas été résolu
      if (rouages.etapeActuelle !== 0) {
        return res.status(409).send({ message: 'Forbidden, this puzzle has already been solved' });
      }

      // On check que l'utilisateur possède l'objet
      if (!user.items.includes(item)) {
        return res.status(409).send({ message: "Forbidden, you don't have this item" });
      }

      const gears: Item[] = ['engrenageGrand', 'engrenageMoyen'];
      // On check que l'objet est un engrenage
      if (!gears.includes(item)) {
        return res.status(409).send({ message: 'Forbidden, this item is not allowed' });
      }

      user.items.splice(user.items.indexOf(item), 1);
      rouages.items.push(item);
      game.rouages = rouages;

      await updateUser(user);
      await updateGame(game);

      res.status(200).send({
        status: 'ok',
        user,
        game: {
          rouages: rouages,
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  removeGearRouages: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 2) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const { item } = req.body;

      if (!item) {
        return res.status(400).send({ message: '"item" is required' });
      }

      const rouages = game.rouages;

      // On check que les rouages n'ont pas été résolu
      if (rouages.etapeActuelle !== 0) {
        return res.status(409).send({ message: 'Forbidden, this puzzle has already been solved' });
      }

      // On check que l'objet est posé dans les rouages
      if (!rouages.items.includes(item)) {
        return res.status(409).send({ message: 'Forbidden, this item is not on this puzzle' });
      }

      rouages.items.splice(rouages.items.indexOf(item), 1);
      game.rouages = rouages;
      user.items.push(item);

      await updateUser(user);
      await updateGame(game);

      res.status(200).send({
        status: 'ok',
        user,
        game: {
          rouages: rouages,
        },
      });
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },

  solveRouages: async (req: Request, res: Response) => {
    const { userId, gameId } = req.body.jwt;

    try {
      const user = (await getUserById(userId)) as User;
      const game = (await getGameById(gameId)) as Game;
      const salle = user.salle;

      if (salle !== 2) {
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const { configuration } = req.body;

      if (!configuration) {
        return res.status(400).send({ message: '"configuration" is required' });
      }

      const rouages = game.rouages;

      // On check que les rouages n'ont pas été résolu
      if (rouages.etapeActuelle !== 0) {
        return res.status(409).send({ message: 'Forbidden, this puzzle has already been solved' });
      }

      const gears: Item[] = ['engrenageGrand', 'engrenageMoyen'];

      // On check que les deux engrenages sont posés
      if (!rouages.items.includes(gears[0]) || !rouages.items.includes(gears[1])) {
        return res.status(409).send({ message: 'Forbidden, all gears are not in place' });
      }

      // On check que la position est correcte
      if (configuration == 'GPPM') {
        rouages.etapeActuelle = 1;
        game.rouages = rouages;
        game.itemsDispo[user.salle!].push('gemmeRonde');

        await updateGame(game);

        res.status(200).send({
          status: 'ok',
          user,
          game: {
            itemsDispo: game.itemsDispo[user.salle!],
            rouages: rouages,
          },
        });
      } else {
        res.status(200).send({
          status: 'no',
          user,
          game: {
            rouages: rouages,
          },
        });
      }
    } catch (error) {
      console.error('Error during game ' + gameId + ':', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  },
};
