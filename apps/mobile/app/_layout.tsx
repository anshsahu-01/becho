import "../global.css";
import { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, ClerkLoaded, useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@/utils/tokenCache";
import { LoadingState } from "@/components/LoadingState";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useAuth } from "@/hooks/useAuth";

import * as authService from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in .env.");
}

function InitialLayout() {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const segments = useSegments();
  const router = useRouter();

  const hydrateCart = useCartStore((state) => state.hydrate);
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate);

  // Sync session and load user profile
  useEffect(() => {
    const syncSession = async () => {
      if (isSignedIn) {
        useAuthStore.setState({ isHydrated: false });
        try {
          const token = await getToken();
          if (token) {
            useAuthStore.setState({ token });
            const user = await authService.getMe(token);
            useAuthStore.setState({ user, isHydrated: true });
          } else {
            useAuthStore.setState({ token: null, user: null, isHydrated: true });
          }
        } catch (error) {
          console.error("Error syncing session:", error);
          useAuthStore.setState({ token: null, user: null, isHydrated: true });
        }
      } else {
        useAuthStore.setState({ token: null, user: null, isHydrated: true });
      }
    };

    if (isLoaded) {
      syncSession();
    }
  }, [isLoaded, isSignedIn]);

  // Hydrate local stores on startup
  useEffect(() => {
    hydrateCart();
    hydrateFavorites();
  }, [hydrateCart, hydrateFavorites]);

  const isHydrated = useAuthStore((s) => s.isHydrated);
  const segmentsKey = segments.join("/");

  useEffect(() => {
    if (!isLoaded || !isHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthGroup) {
      // Redirect to login if signed out and attempting to access app
      router.replace("/(auth)/login");
    } else if (isSignedIn && inAuthGroup) {
      // Redirect to main tabs if signed in and attempting to access auth screen
      router.replace("/(tabs)");
    }
  }, [isSignedIn, isLoaded, isHydrated, segmentsKey]);

  if (!isLoaded || !isHydrated) {
    return <LoadingState />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product/[id]"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="product/edit/[id]"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="checkout"
          options={{ headerShown: false, presentation: "card" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
