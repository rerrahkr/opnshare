import { onAuthStateChanged, type User } from "firebase/auth";
import { create } from "zustand";
import { auth } from "@/lib/firebase";

type AuthState = {
  user: User | null;
  hasInitialized: boolean;

  initialize: () => () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  hasInitialized: false,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({
        user,
        hasInitialized: true,
      });
    });

    return unsubscribe;
  },
}));

export function useAuthUser() {
  return useAuthStore((state) => state.user);
}

export function useIsSignedIn() {
  return useAuthStore((state) => state.user !== null);
}
