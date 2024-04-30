import AbstractDocument from './AbstractDocument';
import User from './user';

export type GameAttributes = {
  id: string;
  users: string[];
  trappe: boolean;
  tuyau: boolean;
  coffre: boolean;
  rouages: number;
  portes: boolean;
  itemsDispo: string[];
};

export default class Game implements AbstractDocument {
  id: GameAttributes['id'];
  users: GameAttributes['users'];
  trappe: GameAttributes['trappe'];
  tuyau: GameAttributes['tuyau'];
  coffre: GameAttributes['coffre'];
  rouages: GameAttributes['rouages'];
  portes: GameAttributes['portes'];
  itemsDispo: GameAttributes['itemsDispo'];

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

  toFirestore(): GameAttributes {
    return {
      id: this.id,
      users: this.users,
      trappe: this.trappe,
      tuyau: this.tuyau,
      coffre: this.coffre,
      rouages: this.rouages,
      portes: this.portes,
      itemsDispo: this.itemsDispo,
    };
  }

  static fromFirestore(attributes: GameAttributes) {
    const game = new Game();
    game.id = attributes.id;
    game.users = attributes.users;
    game.trappe = attributes.trappe;
    game.tuyau = attributes.tuyau;
    game.coffre = attributes.coffre;
    game.rouages = attributes.rouages;
    game.portes = attributes.portes;
    game.itemsDispo = attributes.itemsDispo;

    return game;
  }
}
