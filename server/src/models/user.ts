import AbstractDocument from './AbstractDocument';
import Game from './game';
import { getGameById } from '../services/gamesServices';

export interface UserFirestore extends AbstractDocument {
  id: string;
  name: string;
  salle: number | null;
  game: string | null;
}

export default class User {
  id: string;
  name: string;
  salle: number | null;
  game: string | null;

  constructor(name?: string) {
    this.id = '-1';
    this.name = name || 'Anonymous';
    this.salle = null;
    this.game = null;
  }
}

export const userConverter = {
  toFirestore: (user: User): UserFirestore => {
    return {
      id: user.id,
      name: user.name,
      salle: user.salle,
      game: user.game,
    };
  },

  fromFirestore: (userFirestore: UserFirestore) => {
    const user = new User();
    user.id = userFirestore.id;
    user.name = userFirestore.name;
    user.salle = userFirestore.salle;
    user.game = userFirestore.game;

    return user;
  },
};
