import User from './user';
import AbstractDocument from './AbstractDocument';
import { getUserById } from '../services/usersServices';
import { Enigme } from './enigme';
import { Item } from './item';

export interface GameDatabase extends AbstractDocument {
  id: string;
  hasStarted: boolean;
  users: string;
  trappe: string;
  tuyau: string;
  coffre: string;
  rouages: string;
  portes: string;
  itemsDispo: string;
  callId: string;
}

export default class Game {
  id: string = '-1';
  hasStarted: boolean = false;
  users: User[];
  trappe: Enigme;
  tuyau: Enigme;
  coffre: Enigme;
  rouages: Enigme;
  portes: Enigme;
  itemsDispo: { [key: number]: Item[] };
  callId: string = '';

  constructor(user?: User) {
    this.users = user ? [user] : [];
    this.trappe = initEnigme(1);
    this.tuyau = initEnigme(2);
    this.coffre = initEnigme(1);
    this.coffre = initEnigme(1);
    this.rouages = initEnigme(1);
    this.portes = initEnigme(1);
    this.itemsDispo = {
      1: ['engrenageMoyen', 'cle'],
      2: ['engrenageGrand'],
      3: [],
    };
  }
}

const initEnigme = (nbEtapes: number, etapeActuelle: number = 0, items: Item[] = []): Enigme => {
  return { nbEtapes, etapeActuelle, items };
};

export const gameConverter = {
  toDatabase: (game: Game): GameDatabase => {
    return {
      id: game.id,
      hasStarted: game.hasStarted,
      users: JSON.stringify(game.users.map((user) => user.id)),
      trappe: JSON.stringify(game.trappe),
      tuyau: JSON.stringify(game.tuyau),
      coffre: JSON.stringify(game.coffre),
      rouages: JSON.stringify(game.rouages),
      portes: JSON.stringify(game.portes),
      itemsDispo: JSON.stringify(game.itemsDispo),
      callId: game.callId,
    };
  },

  fromDatabase: async (gameDatabase: GameDatabase) => {
    const game = new Game();
    game.id = gameDatabase.id;
    game.hasStarted = gameDatabase.hasStarted;

    const users = JSON.parse(gameDatabase.users);
    game.users = (
      await Promise.all(
        users.map(async (userId: string) => {
          return await getUserById(userId);
        })
      )
    ).filter((user) => user) as User[];

    game.trappe = JSON.parse(gameDatabase.trappe);
    game.tuyau = JSON.parse(gameDatabase.tuyau);
    game.coffre = JSON.parse(gameDatabase.coffre);
    game.rouages = JSON.parse(gameDatabase.rouages);
    game.portes = JSON.parse(gameDatabase.portes);
    game.itemsDispo = JSON.parse(gameDatabase.itemsDispo);
    game.callId = gameDatabase.callId;
    return game;
  },
};
