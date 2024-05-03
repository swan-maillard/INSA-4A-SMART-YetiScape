import User from './user';
import AbstractDocument from './AbstractDocument';
import { getUserById } from '../services/usersServices';
import Enigme from './enigme';
import { createEnigme, getEnigmeById } from '../services/enigmesServices';
import { Item } from './item';

export interface GameFirestore extends AbstractDocument {
  id: string;
  users: string[];
  trappe: string | null;
  tuyau: string | null;
  coffre: string | null;
  rouages: string | null;
  portes: string | null;
  itemsDispo: Item[];
  callId: string | null;
}

export default class Game {
  id: string = '-1';
  users: User[];
  trappe: Enigme | null = null;
  tuyau: Enigme | null = null;
  coffre: Enigme | null = null;
  rouages: Enigme | null = null;
  portes: Enigme | null = null;
  itemsDispo: Item[] = [];
  callId: string | null = null;

  constructor(user?: User) {
    this.users = user ? [user] : [];
  }

  async initEnigmes() {
    const trappeSolutions: [string] = ['110000111001111'];
    this.trappe = await createEnigme(new Enigme('trappe', 1, trappeSolutions));

    const tuyauSolutions: [Item, number] = ['engrenage_grand', 6];
    this.tuyau = await createEnigme(new Enigme('tuyau', 2, tuyauSolutions));

    const coffreSolutions: [number] = [8163];
    const coffreRecompenses: [Item[]] = [['gemme_carre', 'gemme_triangle']];
    this.coffre = await createEnigme(new Enigme('coffre', 1, coffreSolutions, coffreRecompenses));

    const rouageSolutions: [number] = [1234];
    const rouageRecompenses: [Item[]] = [['gemme_cercle']];
    this.rouages = await createEnigme(new Enigme('rouages', 1, rouageSolutions, rouageRecompenses));

    this.portes = await createEnigme(new Enigme('portes', 0));
  }

  getEnigmes(): (Enigme | null)[] {
    return [this.trappe, this.tuyau, this.coffre, this.rouages, this.portes];
  }
}

export const gameConverter = {
  toFirestore: (game: Game): GameFirestore => {
    return {
      id: game.id,
      users: game.users.map((user) => user.id),
      trappe: game.trappe ? game.trappe.id : null,
      tuyau: game.tuyau ? game.tuyau.id : null,
      coffre: game.coffre ? game.coffre.id : null,
      rouages: game.rouages ? game.rouages.id : null,
      portes: game.portes ? game.portes.id : null,
      itemsDispo: game.itemsDispo,
      callId: game.callId,
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

    game.trappe = gameFirestore.trappe ? await getEnigmeById(gameFirestore.trappe) : null;
    game.tuyau = gameFirestore.tuyau ? await getEnigmeById(gameFirestore.tuyau) : null;
    game.coffre = gameFirestore.coffre ? await getEnigmeById(gameFirestore.coffre) : null;
    game.rouages = gameFirestore.rouages ? await getEnigmeById(gameFirestore.rouages) : null;
    game.portes = gameFirestore.portes ? await getEnigmeById(gameFirestore.portes) : null;
    game.itemsDispo = gameFirestore.itemsDispo;
    game.callId = gameFirestore.callId;

    return game;
  },
};
