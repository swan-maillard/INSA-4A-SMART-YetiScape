import { Item } from '../models/item';

export type Enigme = {
  nbEtapes: number;
  etapeActuelle: number;
  items: Item[];
};
