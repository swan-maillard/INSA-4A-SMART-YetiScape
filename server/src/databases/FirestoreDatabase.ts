import { initializeApp } from 'firebase/app';
import {
  type Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  Query,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import AbstractDocument from '../models/AbstractDocument';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAQpw9jEE5MriT1Pnf2L8roSCnxDfU7O8w',
  authDomain: 'smart-f20d2.firebaseapp.com',
  projectId: 'smart-f20d2',
  storageBucket: 'smart-f20d2.appspot.com',
  messagingSenderId: '519977661583',
  appId: '1:519977661583:web:3e5ee4f17b62bc9a53ecfa',
};

export default class FirestoreDatabase {
  private readonly db: Firestore;

  constructor() {
    const firebaseApp = initializeApp(FIREBASE_CONFIG);
    this.db = getFirestore(firebaseApp);
    console.log('Firestore Database connected');
  }

  getRef(collectionName: string) {
    return collection(this.db, collectionName);
  }

  async getFromQuery<T extends AbstractDocument>(query: Query): Promise<T[]> {
    const querySnapshot = await getDocs(query);
    return querySnapshot.docs.map((doc) => doc.data()) as T[];
  }

  async getAll<T extends AbstractDocument>(collectionName: string): Promise<T[]> {
    const querySnapshot = await getDocs(collection(this.db, collectionName));
    return querySnapshot.docs.map((doc) => doc.data()) as T[];
  }

  async getOne<T extends AbstractDocument>(collectionName: string, documentId: string): Promise<T | null> {
    const documentSnapshot = await getDoc(doc(this.db, collectionName, documentId.toString()));
    if (documentSnapshot.exists()) {
      return documentSnapshot.data() as T;
    } else {
      return null;
    }
  }

  async create<T extends AbstractDocument>(collectionName: string, data: T) {
    data.id = new Date().getTime().toString();
    await setDoc(doc(this.db, collectionName, data.id), data);
    return data.id;
  }

  async update<T extends AbstractDocument>(collectionName: string, data: T) {
    await setDoc(doc(this.db, collectionName, data.id), data, { merge: true });
  }

  async delete(collectionName: string, documentId: string) {
    await deleteDoc(doc(this.db, collectionName, documentId.toString()));
  }
}
