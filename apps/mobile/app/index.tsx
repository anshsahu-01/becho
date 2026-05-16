import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/LoadingState";

export default function Index() {
  const { isHydrated, isAuthenticated } = useAuth();

  if (!isHydrated) {
    return <LoadingState />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
