import AbstractDocument from './AbstractDocument';
import Game from './game';
import { getGameById } from '../services/gamesServices';

export type Item = 'gemme_triangle' | 'gemme_carre' | 'gemme_cercle' | 'engrenage_grand' | 'engrenage_petit';
