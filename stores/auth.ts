import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  onAuthStateChanged, 
  signOut, 
  type User,
  getIdToken 
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

type AuthState = {
  isLoading: boolean;
  isSignedIn: boolean;
  isInitialized: boolean;

  getCurrentUser: () => User | null;
  getToken: () => Promise<string | null>;
  initialize: () => () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoading: true,
      isSignedIn: false,
      isInitialized: false,
      
      getCurrentUser: () => {
        return auth.currentUser
      },
      
      getToken: async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          return null;
        }

        try {
          return await getIdToken(currentUser);
        } catch (error) {
          console.error('Token retrieval error:', error);
          return null;
        }
      },

      initialize: () => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          set({
            isSignedIn: !!user,
            isLoading: false,
            isInitialized: true
          })
        })
        
        return unsubscribe
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isSignedIn: state.isSignedIn 
      })
    }
  )
)

export function useGetCurrentUser() {
    return useAuthStore((state) => state.getCurrentUser);
}

export function useGetToken() {
    return useAuthStore((state) => state.getToken);
}

export function useIsSignedIn() {
    return useAuthStore((state) => state.isSignedIn);
}
