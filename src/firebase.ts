import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
  updateDoc,
  getDocFromServer,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Product, Category, Review, User, Notification } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_REVIEWS } from './data';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Get Firestore instance with specific databaseId as compiled in the config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Authentication Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Operational Types for debugging logs
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Mandatory Error Handler adhering to detailed security rules diagnostic mandates
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on initial boot
 */
export async function testConnection() {
  try {
    // Attempt the light-weight server handshake
    await getDocFromServer(doc(db, 'system', 'connection_handshake'));
    console.log('Firebase connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
    // We do not throw to avoid crashing splash screen but print trace
  }
}

/**
 * Automatic Database seeder: Checks if products exist. If not, seeds initial datasets.
 */
export async function seedDatabaseIfEmpty() {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      console.log('Seeding initial categories to Firestore...');
      for (const cat of INITIAL_CATEGORIES) {
        if (cat.id !== 'all') { // Skip "Todo" filter
          await setDoc(doc(db, 'categories', cat.id), cat);
        }
      }

      console.log('Seeding initial products to Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }

      console.log('Seeding initial reviews to Firestore...');
      for (const rev of INITIAL_REVIEWS) {
        await setDoc(doc(db, 'reviews', rev.id), rev);
      }

      console.log('Database successfully seeded with menu defaults.');
    }
  } catch (error) {
    console.error('Database seeding skipped or failed (likely due to permissions):', error);
  }
}

// ---------------------- Collections Wrappers ----------------------

// PRODUCTS
export async function fetchProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(doc => doc.data() as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// CATEGORIES
export async function fetchCategories(): Promise<Category[]> {
  const path = 'categories';
  try {
    const snap = await getDocs(collection(db, path));
    const items = snap.docs.map(doc => doc.data() as Category);
    // prepend 'Todo'
    return [{ id: 'all', name: 'Todo', icon: 'Utensils' }, ...items];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// REVIEWS
export async function fetchReviews(): Promise<Review[]> {
  const path = 'reviews';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(doc => doc.data() as Review);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function submitReview(review: Review): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    await setDoc(doc(db, 'reviews', review.id), review);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// USERS & VIP CLIENTS
export async function fetchUserById(uid: string): Promise<User | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserToFirestore(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    await setDoc(doc(db, 'users', user.uid), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserPoints(uid: string, points: number, tier: 'Bronce' | 'Plata' | 'Oro'): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), { points, tier });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserWhatsApp(uid: string, phone: string, verified: boolean): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), { 
      phone, 
      whatsappVerified: verified 
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// NOTIFICATIONS
export async function fetchNotifications(): Promise<Notification[]> {
  const path = 'notifications';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(doc => doc.data() as Notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addNotification(notification: Notification): Promise<void> {
  const path = `notifications/${notification.id}`;
  try {
    await setDoc(doc(db, 'notifications', notification.id), notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateNotificationRead(id: string, isRead: boolean): Promise<void> {
  const path = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), { isRead });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
