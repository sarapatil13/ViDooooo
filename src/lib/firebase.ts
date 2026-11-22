import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';

const env = import.meta.env;

/**
 * Firestore access for the local emulator suite. Authentication is handled by
 * `src/features/auth/firebase.ts`; this module only owns the shared app and db.
 */
export const USE_EMULATOR = env.VITE_USE_FIREBASE_EMULATOR !== 'false';
export const EMULATOR_HOST = env.VITE_FIREBASE_EMULATOR_HOST ?? '127.0.0.1';
export const AUTH_EMULATOR_PORT = Number(env.VITE_AUTH_EMULATOR_PORT ?? 9099);
export const FIRESTORE_EMULATOR_PORT = Number(
  env.VITE_FIRESTORE_EMULATOR_PORT ?? 8080
);

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'demo-vido-local-key',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-vido.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'demo-vido',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-vido.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: env.VITE_FIREBASE_APP_ID || '1:000000000000:web:localemulator',
};

interface FirebaseBundle {
  app: FirebaseApp;
  db: Firestore;
}

const GLOBAL_KEY = '__vidoFirestoreBundle__';

function createBundle(): FirebaseBundle {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const db = initializeFirestore(app, { ignoreUndefinedProperties: true });

  if (USE_EMULATOR) {
    connectFirestoreEmulator(db, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  }

  return { app, db };
}

// Reuse the same instances across Vite hot reloads so we never call
// initializeApp / connectFirestoreEmulator twice.
const store = globalThis as unknown as Record<string, FirebaseBundle | undefined>;
const bundle = store[GLOBAL_KEY] ?? createBundle();
store[GLOBAL_KEY] = bundle;

export const app = bundle.app;
export const db = bundle.db;
