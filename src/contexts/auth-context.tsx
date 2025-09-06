
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: (FirebaseUser & { role?: UserRole; displayName?: string | null; }) | null;
  loading: boolean;
  signOutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<(FirebaseUser & { role?: UserRole; displayName?: string | null; }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        const unsubscribeFirestore = onSnapshot(userDocRef, (userDocSnap) => {
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data() as Omit<User, 'uid'>;
                
                // We sync the displayName from Firestore to Firebase Auth
                // as Firestore is our source of truth for the user's name.
                if (firebaseUser.displayName !== userData.name) {
                    updateProfile(firebaseUser, { displayName: userData.name });
                }

                setUser({ 
                    ...firebaseUser, 
                    role: userData.role,
                    displayName: userData.name,
                });
            } else {
                // Handle case where user exists in Auth but not in Firestore
                setUser(firebaseUser);
            }
        });

        if (loading) setLoading(false);

        // Detach Firestore listener when auth state changes
        return () => unsubscribeFirestore();

      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [loading]);
  
  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
