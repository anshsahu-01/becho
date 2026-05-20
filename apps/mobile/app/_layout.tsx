import { ActivityIndicator, View } from "react-native";
import "../global.css";
import { useEffect } from "react";
import { Stack, useSegments, useRouter, useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, ClerkLoaded, useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@/utils/tokenCache";
import { LoadingState } from "@/components/LoadingState";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";

import * as authService from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { clearAuthStorage } from "@/utils/storage";
import { disconnectSocket } from "@/services/socket.service";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in .env.");
}

function InitialLayout() {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const isRouterReady = !!navigationState?.key;

  const hydrateCart = useCartStore((state) => state.hydrate);
  const verifyCartItems = useCartStore((state) => state.verifyItems);
  const setCartOwnerUserId = useCartStore((state) => state.setOwnerUserId);
  const hydrateFavorites = useFavoritesStore((state) => state.hydrate);
  const authUserId = useAuthStore((state) => state.user?.id ?? null);

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
            disconnectSocket();
            await clearAuthStorage();
            await setCartOwnerUserId(null);
            useAuthStore.setState({ token: null, user: null, isHydrated: true });
          }
        } catch (error) {
          console.error("Error syncing session:", error);
          disconnectSocket();
          await clearAuthStorage();
          await setCartOwnerUserId(null);
          useAuthStore.setState({ token: null, user: null, isHydrated: true });
        }
      } else {
        disconnectSocket();
        await clearAuthStorage();
        await setCartOwnerUserId(null);
        useAuthStore.setState({ token: null, user: null, isHydrated: true });
      }
    };

    if (isLoaded) {
      syncSession();
    }
  }, [isLoaded, isSignedIn]);

  // Hydrate local stores on startup
  useEffect(() => {
    hydrateFavorites();
  }, [hydrateFavorites]);

  const isHydrated = useAuthStore((s) => s.isHydrated);
  const segmentsKey = segments.join("/");

  useEffect(() => {
    if (!isLoaded || !isHydrated) return;

    const syncCartState = async () => {
      await hydrateCart(authUserId);
      await verifyCartItems();
    };

    syncCartState();
  }, [authUserId, hydrateCart, isHydrated, isLoaded, verifyCartItems]);

  useEffect(() => {
    if (!isLoaded || !isHydrated || !isRouterReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthGroup) {
      // Redirect to login if signed out and attempting to access app
      router.navigate("/(auth)/login");
    } else if (isSignedIn && inAuthGroup) {
      // Redirect to main tabs if signed in and attempting to access auth screen
      router.navigate("/(tabs)");
    }
  }, [isSignedIn, isLoaded, isHydrated, segmentsKey, isRouterReady]);

  if (!isRouterReady) {
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
        <Stack.Screen
          name="profile/edit-profile"
          options={{ headerShown: false, presentation: "card" }}
        />
      </Stack>
      {(!isLoaded || !isHydrated) && (
        <View className="absolute inset-0 bg-white items-center justify-center z-[9999]">
          <ActivityIndicator size="large" color="#1A1A1A" />
        </View>
      )}
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
