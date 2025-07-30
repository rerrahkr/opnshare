import { onAuthStateChanged, type User } from "firebase/auth";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { auth, getUserId } from "@/lib/firebase";

type AuthState = {
  user: User | null;
  userId: string;
  hasInitialized: boolean;

  initialize: () => () => void;

  setUserId: (userId: string) => void;
  updateUserId: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  immer((set, get) => ({
    user: null,
    userId: "",
    hasInitialized: false,

    initialize: () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        set({
          user,
          userId: user ? await getUserId(user.uid) : "",
          hasInitialized: true,
        });
      });

      return unsubscribe;
    },

    setUserId: (userId: string) => {
      set((state) => {
        state.userId = userId;
      });
    },

    updateUserId: async () => {
      const user = get().user;
      const userId = user ? await getUserId(user.uid) : "";
      set((state) => {
        state.userId = userId;
      });
    },
  }))
);

export function useAuthUser() {
  return useAuthStore((state) => state.user);
}

export function useAuthUserId() {
  return useAuthStore((state) => state.userId);
}
