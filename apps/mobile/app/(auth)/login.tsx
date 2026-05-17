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
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(email.trim().toLowerCase(), password);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
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
          <View className="mb-6 ">
            <BrandMark subtitle="Buy and sell on your campus" size={350} />
          </View>

          <View className="rounded-2xl border border-line bg-white p-5">
            <Text className="mb-1 text-[24px] font-semibold text-ink">Welcome back</Text>
            <Text className="mb-5 text-[15px] text-muted">Log in to continue</Text>

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
              {error ? <Text className="mb-3 text-[13px] text-danger">{error}</Text> : null}
              <Button title="Log in" onPress={handleLogin} loading={loading} className="rounded-2xl" />
            </View>

            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text className="text-center text-[15px] text-muted">
                New here? <Text className="font-medium text-ink">Create account</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
