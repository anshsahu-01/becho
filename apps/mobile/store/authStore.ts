import { create } from "zustand";
import * as authService from "@/services/auth.service";
import { RegisterInput, User } from "@/types";
import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "@/utils/storage";

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  hydrate: async () => {
    try {
      const token = await getToken();
      if (!token) {
        set({ token: null, user: null, isHydrated: true });
        return;
      }

      const storedUser = await getStoredUser<User>();
      if (storedUser) {
        set({ token, user: storedUser, isHydrated: true });
        return;
      }

      const user = await authService.getMe(token);
      await setStoredUser(user);
      set({ token, user, isHydrated: true });
    } catch {
      await clearAuthStorage();
      set({ token: null, user: null, isHydrated: true });
    }
  },

  login: async (email, password) => {
    const { user, token } = await authService.login(email, password);
    await setToken(token);
    await setStoredUser(user);
    set({ user, token });
  },

  register: async (input) => {
    const user = await authService.register(input);
    set({ user });
  },

  logout: async () => {
    await clearAuthStorage();
    set({ user: null, token: null });
  },
}));
