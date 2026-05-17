import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/LoadingState";

export default function RootLayout() {
  const { hydrate, isHydrated } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) {
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
