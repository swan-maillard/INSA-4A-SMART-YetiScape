import AbstractDocument from './AbstractDocument';
import { Item } from './item';

type EnigmeName = 'trappe' | 'tuyau' | 'coffre' | 'rouages' | 'portes';

export interface EnigmeFirestore extends AbstractDocument {
  id: string;
  name: EnigmeName;
  nbEtapes: number;
  etapeActuelle: number;
  solutions: unknown[];
  items: Item[];
  recompenses: string[];
}

export default class Enigme {
  id: string;
  name: EnigmeName;
  nbEtapes: number;
  etapeActuelle: number;
  solutions: unknown[];
  items: Item[];
  recompenses: Item[][];

  constructor(name: EnigmeName, nbEtapes: number = 0, solutions: unknown[] = [], recompenses: Item[][] = []) {
    this.id = '-1';
    this.name = name;
    this.nbEtapes = nbEtapes;
    this.etapeActuelle = 0;
    this.solutions = solutions;
    this.items = [];
    this.recompenses = recompenses;
  }
}

export const enigmeConverter = {
  toFirestore: (enigme: Enigme): EnigmeFirestore => {
    return {
      id: enigme.id,
      name: enigme.name,
      nbEtapes: enigme.nbEtapes,
      etapeActuelle: enigme.etapeActuelle,
      solutions: enigme.solutions,
      items: enigme.items,
      recompenses: enigme.recompenses.map((items) => JSON.stringify(items)),
    };
  },

  fromFirestore: (enigmeFirestore: EnigmeFirestore) => {
    const enigme = new Enigme(enigmeFirestore.name);
    enigme.id = enigmeFirestore.id;
    enigme.nbEtapes = enigmeFirestore.nbEtapes;
    enigme.etapeActuelle = enigmeFirestore.etapeActuelle;
    enigme.solutions = enigmeFirestore.solutions;
    enigme.items = enigmeFirestore.items;
    enigme.recompenses = enigmeFirestore.recompenses.map((items) => JSON.parse(items));

    return enigme;
  },
};
