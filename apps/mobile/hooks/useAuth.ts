import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { useAuthStore } from "@/store/authStore";
import { clearAuthStorage } from "@/utils/storage";
import { disconnectSocket } from "@/services/socket.service";
import { useCartStore } from "@/store/cartStore";

export function useAuth() {
  const { isSignedIn, isLoaded, signOut } = useClerkAuth();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isHydratedStore = useAuthStore((s) => s.isHydrated);

  const isHydrated = isLoaded && isHydratedStore;

  const logout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Clerk signOut error:", err);
    }
    disconnectSocket();
    await clearAuthStorage();
    await useCartStore.getState().setOwnerUserId(null);
    useAuthStore.setState({ user: null, token: null });
  };

  return {
    user,
    token,
    isHydrated,
    isAuthenticated: Boolean(isSignedIn && token && user),
    login: async () => {},
    register: async () => {},
    logout,
    hydrate: async () => {},
  };
}
