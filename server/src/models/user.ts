import AbstractDocument from './AbstractDocument';
import { Item } from './item';

export interface UserDatabase extends AbstractDocument {
  id: string;
  name: string;
  salle: number | null;
  game: string | null;
  items: string;
}

export default class User {
  id: string;
  name: string;
  salle: number | null;
  game: string | null;
  items: Item[];

  constructor(name: string) {
    this.id = '-1';
    this.name = name;
    this.salle = null;
    this.game = null;
    this.items = [];
  }
}

export const userConverter = {
  toDatabase: (user: User): UserDatabase => {
    return {
      id: user.id,
      name: user.name,
      salle: user.salle,
      game: user.game,
      items: JSON.stringify(user.items),
    };
  },

  fromDatabase: (userDatabase: UserDatabase) => {
    const user = new User(userDatabase.name);
    user.id = userDatabase.id;
    user.salle = userDatabase.salle;
    user.game = userDatabase.game;
    user.items = JSON.parse(userDatabase.items);

    return user;
  },
};
