import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<UserCredential>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Store auth state in AsyncStorage for offline access
      if (user) {
        AsyncStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }));
      } else {
        AsyncStorage.removeItem('user');
      }
    });

    // Load cached user data on app start
    const loadCachedUser = async () => {
      try {
        const cachedUser = await AsyncStorage.getItem('user');
        if (cachedUser && !user) {
          // Firebase will handle the actual auth state
          // This is just for initial UI state
        }
      } catch (error) {
        console.error('Error loading cached user:', error);
      }
    };

    loadCachedUser();

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      return result;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const signOutUser = async (): Promise<void> => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  };

  const signInWithGoogle = async (idToken: string): Promise<UserCredential> => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      return result;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(getFirebaseErrorMessage(error.code));
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string): Promise<void> => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await updateProfile(user, { 
        displayName, 
        ...(photoURL && { photoURL }) 
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut: signOutUser,
    signInWithGoogle,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper function to convert Firebase error codes to user-friendly messages
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
};