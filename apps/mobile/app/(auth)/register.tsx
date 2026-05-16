import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Fill all fields. Password must be 6+ characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        collegeName: collegeName.trim() || undefined,
      });
      router.replace("/(auth)/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
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
          contentContainerClassName="p-5 pt-3"
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} className="mb-4">
            <Text className="text-[15px] text-ink">← Back</Text>
          </Pressable>

          <Text className="mb-1 text-[20px] font-bold text-ink">Create account</Text>
          <Text className="mb-5 text-[15px] text-muted">Join your campus marketplace</Text>

          <Input label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@college.edu"
          />
          <Input
            label="College"
            value={collegeName}
            onChangeText={setCollegeName}
            placeholder="College name (optional)"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Min 6 characters"
          />

          {error ? <Text className="mb-3 text-[13px] text-danger">{error}</Text> : null}
          <Button title="Sign up" onPress={handleRegister} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
