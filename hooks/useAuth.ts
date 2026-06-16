import { useCallback, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import type { AuthUser } from '@/types';

interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(
        firebaseUser
          ? { uid: firebaseUser.uid, email: firebaseUser.email }
          : null,
      );
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (error) {
        throw new Error(getFirebaseErrorMessage(error));
      }
    },
    [],
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  }, []);

  return { user, loading, signIn, signOut };
}
