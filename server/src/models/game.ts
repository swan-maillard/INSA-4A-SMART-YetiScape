import User from './user';
import AbstractDocument from './AbstractDocument';
import { getUserById } from '../services/usersServices';
import { Enigme } from './enigme';
import { Item } from './item';

export interface GameFirestore extends AbstractDocument {
  id: string;
  users: string[];
  trappe: string;
  tuyau: string;
  coffre: string;
  rouages: string;
  portes: string;
  itemsDispo: string;
}

export default class Game {
  id: string = '-1';
  users: User[];
  trappe: Enigme;
  tuyau: Enigme;
  coffre: Enigme;
  rouages: Enigme;
  portes: Enigme;
  itemsDispo: { [key: number]: Item[] };

  constructor(user?: User) {
    this.users = user ? [user] : [];
    this.trappe = initEnigme(1);
    this.tuyau = initEnigme(2);
    this.coffre = initEnigme(1);
    this.coffre = initEnigme(1);
    this.rouages = initEnigme(1);
    this.portes = initEnigme(0);
    this.itemsDispo = {
      1: ['engrenage_grand'],
      2: ['engrenage_petit'],
      3: [],
    };
  }
}

const initEnigme = (nbEtapes: number, etapeActuelle: number = 0, items: Item[] = []): Enigme => {
  return { nbEtapes, etapeActuelle, items };
};

export const gameConverter = {
  toFirestore: (game: Game): GameFirestore => {
    return {
      id: game.id,
      users: game.users.map((user) => user.id),
      trappe: JSON.stringify(game.trappe),
      tuyau: JSON.stringify(game.tuyau),
      coffre: JSON.stringify(game.coffre),
      rouages: JSON.stringify(game.rouages),
      portes: JSON.stringify(game.portes),
      itemsDispo: JSON.stringify(game.itemsDispo),
    };
  },

  fromFirestore: async (gameFirestore: GameFirestore) => {
    const game = new Game();
    game.id = gameFirestore.id;

    game.users = (
      await Promise.all(
        gameFirestore.users.map(async (userId) => {
          return await getUserById(userId);
        })
      )
    ).filter((user) => user) as User[];

    game.trappe = JSON.parse(gameFirestore.trappe);
    game.tuyau = JSON.parse(gameFirestore.tuyau);
    game.coffre = JSON.parse(gameFirestore.coffre);
    game.rouages = JSON.parse(gameFirestore.rouages);
    game.portes = JSON.parse(gameFirestore.portes);
    game.itemsDispo = JSON.parse(gameFirestore.itemsDispo);

    return game;
  },
};
