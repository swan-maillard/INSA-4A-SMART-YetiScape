import { initializeApp } from 'firebase/app';
import {
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
import AbstractDocument from './models/AbstractDocument';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAQpw9jEE5MriT1Pnf2L8roSCnxDfU7O8w',
  authDomain: 'smart-f20d2.firebaseapp.com',
  projectId: 'smart-f20d2',
  storageBucket: 'smart-f20d2.appspot.com',
  messagingSenderId: '519977661583',
  appId: '1:519977661583:web:3e5ee4f17b62bc9a53ecfa',
};

const firebaseApp = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(firebaseApp);

export default {
  getRef: (collectionName: string) => {
    return collection(db, collectionName);
  },

  getFromQuery: async <T extends AbstractDocument>(query: Query): Promise<T[]> => {
    const querySnapshot = await getDocs(query);
    return querySnapshot.docs.map((doc) => doc.data()) as T[];
  },

  getAll: async <T extends AbstractDocument>(collectionName: string): Promise<T[]> => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => doc.data()) as T[];
  },

  getOne: async <T extends AbstractDocument>(collectionName: string, documentId: string): Promise<T | null> => {
    const documentSnapshot = await getDoc(doc(db, collectionName, documentId.toString()));
    if (documentSnapshot.exists()) {
      return documentSnapshot.data() as T;
    } else {
      return null;
    }
  },

  create: async <T extends AbstractDocument>(collectionName: string, data: T) => {
    data.id = Timestamp.now().toMillis().toString();
    await setDoc(doc(db, collectionName, data.id), data);
    return data.id;
  },

  update: async <T extends AbstractDocument>(collectionName: string, data: T) => {
    await setDoc(doc(db, collectionName, data.id), data, { merge: true });
  },

  delete: async (collectionName: string, documentId: string) => {
    await deleteDoc(doc(db, collectionName, documentId.toString()));
  },
};
