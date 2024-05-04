import FirestoreDatabase from './FirestoreDatabase';
import SqliteDatabase from './SqliteDatabase';

type DatabaseDriver = 'firestore' | 'sqlite';

export const dbDriver: DatabaseDriver = 'sqlite';

const db = () => {
  switch (dbDriver as DatabaseDriver) {
    case 'firestore':
      return new FirestoreDatabase();
    case 'sqlite':
      return new SqliteDatabase();
  }
};

export default db();
