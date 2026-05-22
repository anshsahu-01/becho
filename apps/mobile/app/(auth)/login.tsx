import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth as useClerkAuth, useSignIn, useUser } from "@clerk/clerk-expo";

import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

import * as authService from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { setStoredUser, setToken } from "@/utils/storage";

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const syncLocalSession = async () => {
    await clerkUser?.reload();

    const token = await getToken();

    if (!token) {
      throw new Error("Could not restore session");
    }

    const user = await authService.getMe(token);

    await setToken(token);
    await setStoredUser(user);

    useAuthStore.setState({
      token,
      user,
      isHydrated: true,
    });
  };

  const handleLogin = async () => {
    if (!isLoaded || loading) return;

    if (!email.trim() || !password.trim()) {
      setError("Enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      useAuthStore.setState({
        isHydrated: false,
      });

      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
        password,
      });

      // ONLY allow fully completed login
      if (result.status !== "complete") {
        useAuthStore.setState({
          isHydrated: true,
        });

        setError(
          "Login could not complete. Please reset your password once from Clerk dashboard or create a new account."
        );

        return;
      }

      if (!result.createdSessionId) {
        throw new Error("Session creation failed");
      }

      await setActive({
        session: result.createdSessionId,
      });

      await syncLocalSession();

      router.replace("/(tabs)");
    } catch (err: any) {
      useAuthStore.setState({
        isHydrated: true,
      });

      const clerkMessage =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Login failed";

      setError(clerkMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center p-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <BrandMark
              subtitle="Buy and sell on your campus"
              size={350}
            />
          </View>

          <View className="rounded-2xl border border-line bg-white p-5">
            <Text className="mb-1 text-[24px] font-semibold text-ink">
              Welcome back
            </Text>

            <Text className="mb-5 text-[15px] text-muted">
              Log in to continue
            </Text>

            <View className="mb-4">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@college.edu"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Your password"
              />

              <Pressable
                onPress={() =>
                  router.push("/(auth)/forgot-password")
                }
                className="self-end mb-4"
              >
                <Text className="text-[14px] font-medium text-ink">
                  Forgot password?
                </Text>
              </Pressable>

              {error ? (
                <Text className="mb-3 text-[13px] text-danger">
                  {error}
                </Text>
              ) : null}

              <Button
                title="Log in"
                onPress={handleLogin}
                loading={loading}
                className="rounded-2xl"
              />
            </View>

            <Pressable
              onPress={() =>
                router.push("/(auth)/register")
              }
            >
              <Text className="text-center text-[15px] text-muted">
                New here?{" "}
                <Text className="font-medium text-ink">
                  Create account
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}