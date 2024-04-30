import User from './user';
import AbstractDocument from './AbstractDocument';

export interface GameFirestore extends AbstractDocument {
  id: string;
  users: string[];
  trappe: boolean;
  tuyau: boolean;
  coffre: boolean;
  rouages: number;
  portes: boolean;
  itemsDispo: string[];
}

export default class Game {
  id: string;
  users: string[];
  trappe: boolean;
  tuyau: boolean;
  coffre: boolean;
  rouages: number;
  portes: boolean;
  itemsDispo: string[];

  constructor(user?: User) {
    this.id = '-1';
    this.users = user ? [user.id] : [];
    this.trappe = false;
    this.tuyau = false;
    this.coffre = false;
    this.rouages = 0;
    this.portes = false;
    this.itemsDispo = [];
  }
}

export const gameConverter = {
  toFirestore: (game: Game): GameFirestore => {
    return {
      id: game.id,
      users: game.users,
      trappe: game.trappe,
      tuyau: game.tuyau,
      coffre: game.coffre,
      rouages: game.rouages,
      portes: game.portes,
      itemsDispo: game.itemsDispo,
    };
  },

  fromFirestore: (gameFirestore: GameFirestore) => {
    const game = new Game();
    game.id = gameFirestore.id;
    game.users = gameFirestore.users;
    game.trappe = gameFirestore.trappe;
    game.tuyau = gameFirestore.tuyau;
    game.coffre = gameFirestore.coffre;
    game.rouages = gameFirestore.rouages;
    game.portes = gameFirestore.portes;
    game.itemsDispo = gameFirestore.itemsDispo;

    return game;
  },
};
