import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignUp } from "@clerk/clerk-expo";
import { Button } from "@/components/Button";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";

export default function VerifyEmailScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [resending, setResending] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Clean Android hardware back button handler
  useEffect(() => {
    const onBackPress = () => {
      router.back();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, []);

  const handleVerify = async (val: string) => {
    if (!isLoaded || !signUp || loading) return;
    try {
      setLoading(true);
      setError("");
      Keyboard.dismiss();
      // Wait 150ms for keyboard dismissal animation to complete before transitioning layout
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = await signUp.attemptEmailAddressVerification({
        code: val,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || "Invalid code");
      setCode(""); // clear input on error so they can re-try
      // Refocus input
      setTimeout(() => inputRef.current?.focus(), 150);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !isLoaded || !signUp) return;
    try {
      setResending(true);
      setError("");
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setCooldown(30);
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(cleanText);
    if (cleanText.length === 6) {
      handleVerify(cleanText);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScreenHeader title="Verify Email" showBack />
      
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="p-5 flex-grow justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-8">
            <View className="h-16 w-16 bg-primary/10 rounded-full items-center justify-center mb-4">
              <Ionicons name="mail-open-outline" size={32} color="#111111" />
            </View>
            <Text className="text-[24px] font-bold text-ink text-center mb-2">
              Enter Verification Code
            </Text>
            <Text className="text-[15px] text-muted text-center max-w-[280px]">
              We sent a 6-digit confirmation code to{"\n"}
              <Text className="font-semibold text-ink">{email || "your email"}</Text>
            </Text>
          </View>

          <View className="mb-8 relative self-center w-full max-w-[340px] h-14">
            {/* Hidden Input spanning the full container area */}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              autoFocus
              className="absolute inset-0 text-[1px] bg-transparent text-transparent z-10"
              style={{ color: "transparent" }}
              editable={!loading}
            />

            {/* Custom 6-Digit Styled Code Boxes (pointerEvents: none ensures taps pass through to the TextInput underneath) */}
            <View
              pointerEvents="none"
              className="flex-row justify-between w-full h-full"
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const digit = code[index] || "";
                const isFocused = index === code.length;
                return (
                  <View
                    key={index}
                    className={`w-12 h-14 rounded-xl border items-center justify-center bg-white ${
                      isFocused
                        ? "border-ink border-2"
                        : digit
                        ? "border-line"
                        : "border-line"
                    }`}
                  >
                    <Text className="text-[20px] font-semibold text-ink">
                      {digit}
                    </Text>
                    {isFocused && (
                      <View className="absolute bottom-3 w-4 h-[2px] bg-ink rounded-full" />
                    )}
                  </View>
                );
              })}
            </View>

            {error ? (
              <Text className="absolute -bottom-6 left-0 right-0 text-center text-[13px] text-danger">
                {error}
              </Text>
            ) : null}
          </View>

          <View className="items-center gap-4">
            <Button
              title="Verify Code"
              onPress={() => handleVerify(code)}
              loading={loading}
              disabled={code.length < 6}
              className="w-full max-w-[340px] rounded-2xl"
            />

            <View className="flex-row items-center justify-center mt-2">
              <Text className="text-[14px] text-muted">Didn't receive the code? </Text>
              {cooldown > 0 ? (
                <Text className="text-[14px] font-medium text-muted">
                  Resend in {cooldown}s
                </Text>
              ) : (
                <Pressable onPress={handleResend} disabled={resending}>
                  <Text className="text-[14px] font-semibold text-ink underline">
                    {resending ? "Sending..." : "Resend"}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
