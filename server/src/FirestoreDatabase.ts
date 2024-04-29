import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, deleteDoc } from 'firebase/firestore';

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
  getAll: async <Type>(collectionName: string): Promise<Type[]> => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Type[];
  },

  getOne: async <Type>(collectionName: string, documentId: string): Promise<Type | null> => {
    const documentSnapshot = await getDoc(doc(db, collectionName, documentId));
    if (documentSnapshot.exists()) {
      return { id: documentSnapshot.id, ...documentSnapshot.data() } as Type;
    } else {
      return null;
    }
  },

  create: async <Type extends { [x: string]: never }>(collectionName: string, data: Type) => {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  },

  update: async <Type extends { [x: string]: never }>(collectionName: string, documentId: string, data: Type) => {
    await setDoc(doc(db, collectionName, documentId), data, { merge: true });
  },

  delete: async (collectionName: string, documentId: string) => {
    await deleteDoc(doc(db, collectionName, documentId));
  },
};
