import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import {
    getAuth,
    initializeAuth,
    type Auth,
    type Persistence,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
} as const;

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

type PersistenceFactory = (storage: unknown) => Persistence;

function resolveAuth(firebaseApp: FirebaseApp): Auth {
    const persistenceFactory = (
        firebaseAuth as unknown as {
            getReactNativePersistence?: PersistenceFactory;
        }
    ).getReactNativePersistence;

    try {
        if (typeof persistenceFactory === 'function') {
            return initializeAuth(firebaseApp, {
                persistence: persistenceFactory(AsyncStorage),
            });
        }
        return initializeAuth(firebaseApp);
    } catch {
        return getAuth(firebaseApp);
    }
}

export const auth: Auth = resolveAuth(app);
export const db: Firestore = getFirestore(app);

export default app;

