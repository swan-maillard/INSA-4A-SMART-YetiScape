import AbstractDocument from './AbstractDocument';
import Game from './game';
import { getGameById } from '../services/gamesServices';
import { Item } from './item';

export interface UserFirestore extends AbstractDocument {
  id: string;
  name: string;
  salle: number | null;
  game: string | null;
  items: Item[];
}

export default class User {
  id: string;
  name: string;
  salle: number | null;
  game: string | null;
  items: Item[];

  constructor(name: string = 'Anonymous') {
    this.id = '-1';
    this.name = name;
    this.salle = null;
    this.game = null;
    this.items = [];
  }
}

export const userConverter = {
  toFirestore: (user: User): UserFirestore => {
    return {
      id: user.id,
      name: user.name,
      salle: user.salle,
      game: user.game,
      items: user.items,
    };
  },

  fromFirestore: (userFirestore: UserFirestore) => {
    const user = new User();
    user.id = userFirestore.id;
    user.name = userFirestore.name;
    user.salle = userFirestore.salle;
    user.game = userFirestore.game;
    user.items = userFirestore.items;

    return user;
  },
};
