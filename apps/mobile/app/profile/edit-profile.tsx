import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth as useClerkAuth, useSession, useUser } from "@clerk/clerk-expo";
import { useAuth } from "@/hooks/useAuth";
import { getMe, updateProfile } from "@/services/user.service";
import { ApiError } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { setStoredUser, setToken } from "@/utils/storage";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditProfileScreen() {
  const { user, token } = useAuth();
  const { getToken } = useClerkAuth();
  const { user: clerkUser, isLoaded: isClerkUserLoaded } = useUser();
  const { session } = useSession();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [mobile, setMobile] = useState((user as any)?.mobileNumber ?? "");
  const [bio, setBio] = useState((user as any)?.bio ?? "");
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [pendingEmail, setPendingEmail] = useState("");
  const pendingEmailAddressRef = useRef<any>(null);

  const normalizedCurrentEmail = useMemo(
    () => user?.email?.trim().toLowerCase() ?? "",
    [user?.email]
  );
  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const hasEmailChange = normalizedEmail.length > 0 && normalizedEmail !== normalizedCurrentEmail;

  const initials = name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

  useEffect(() => {
    if (!verificationVisible || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [verificationVisible, cooldown]);

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
      return;
    }

    Alert.alert("Notice", message);
  };

  const buildProfileFormData = (nextEmail?: string) => {
    const formData = new FormData();
    formData.append("name", name.trim());

    if (nextEmail) {
      formData.append("email", nextEmail);
    } else if (!hasEmailChange && normalizedEmail) {
      formData.append("email", normalizedEmail);
    }

    if (mobile.trim()) formData.append("mobileNumber", mobile.trim());
    if (bio.trim()) formData.append("bio", bio.trim());

    if (localImage) {
      const filename = localImage.split("/").pop() ?? "profile.jpg";
      const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";
      formData.append("profileImage", { uri: localImage, name: filename, type: mimeType } as any);
    }

    return formData;
  };

  const syncLocalUser = async (nextToken?: string) => {
    const resolvedToken = nextToken ?? token;
    if (!resolvedToken) {
      throw new Error("Authentication session is unavailable.");
    }

    const response = await getMe(resolvedToken);
    await setToken(resolvedToken);
    await setStoredUser(response.data);
    useAuthStore.setState({ token: resolvedToken, user: response.data });
  };

  const persistProfile = async (nextEmail?: string, nextToken?: string) => {
    const resolvedToken = nextToken ?? token;
    if (!resolvedToken) {
      throw new Error("Authentication session is unavailable.");
    }

    await updateProfile(buildProfileFormData(nextEmail) as any, resolvedToken);
    await syncLocalUser(resolvedToken);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access to change your picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setLocalImage(result.assets[0].uri);
    }
  };

  const startEmailVerification = async () => {
    if (!isClerkUserLoaded || !clerkUser) {
      throw new Error("Authentication is still loading. Please try again.");
    }

    const existingEmailAddress = clerkUser.emailAddresses.find(
      (item) => item.emailAddress.trim().toLowerCase() === normalizedEmail
    );

    if (existingEmailAddress?.verification?.status === "verified") {
      await session?.reload();
      await clerkUser.reload();
      const freshToken = await getToken();
      await persistProfile(normalizedEmail, freshToken ?? undefined);
      return "verified";
    }

    const emailAddressResource =
      existingEmailAddress ??
      (await clerkUser.createEmailAddress({
        email: normalizedEmail,
      }));

    await emailAddressResource.prepareVerification({ strategy: "email_code" });

    pendingEmailAddressRef.current = emailAddressResource;
    setPendingEmail(normalizedEmail);
    setOtpCode("");
    setOtpError("");
    setCooldown(30);
    setVerificationVisible(true);
    showToast("Verification code sent to your new email.");

    return "pending";
  };

  const handleSave = async () => {
    if (!token || saving || verifyingOtp || resendingOtp) return;

    if (!name.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }

    if (normalizedEmail && !EMAIL_REGEX.test(normalizedEmail)) {
      Alert.alert("Validation", "Please enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      if (hasEmailChange) {
        const result = await startEmailVerification();
        if (result === "verified") {
          showToast("Email updated successfully.");
          Alert.alert("Success", "Profile updated successfully.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      } else {
        await persistProfile();
        Alert.alert("Success", "Profile updated successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof ApiError ? err.message : "Could not update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (verifyingOtp || otpCode.trim().length !== 6) return;

    const pendingEmailAddress = pendingEmailAddressRef.current;
    if (!pendingEmailAddress || !clerkUser) {
      setOtpError("Verification session expired. Please try again.");
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError("");

      const result = await pendingEmailAddress.attemptVerification({
        code: otpCode.trim(),
      });

      if (result?.verification?.status !== "verified") {
        throw new Error("Verification incomplete. Please try again.");
      }

      await session?.reload();
      await clerkUser.reload();

      const freshToken = await getToken();
      await persistProfile(pendingEmail, freshToken ?? undefined);

      pendingEmailAddressRef.current = null;
      setVerificationVisible(false);
      setPendingEmail("");
      setOtpCode("");
      setOtpError("");

      showToast("Email updated successfully.");
      Alert.alert("Success", "Profile updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      setOtpError(err?.errors?.[0]?.message || err?.message || "Invalid verification code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendingOtp || cooldown > 0) return;

    const pendingEmailAddress = pendingEmailAddressRef.current;
    if (!pendingEmailAddress) {
      setOtpError("Verification session expired. Please try again.");
      return;
    }

    try {
      setResendingOtp(true);
      setOtpError("");
      await pendingEmailAddress.prepareVerification({ strategy: "email_code" });
      setCooldown(30);
      showToast("Verification code resent.");
    } catch (err: any) {
      setOtpError(err?.errors?.[0]?.message || err?.message || "Could not resend code");
    } finally {
      setResendingOtp(false);
    }
  };

  const avatarUri = localImage ?? user?.profileImage ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage} activeOpacity={0.8}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor="#C4BEB8"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#C4BEB8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile number</Text>
            <TextInput
              style={styles.input}
              value={mobile}
              onChangeText={setMobile}
              placeholder="+91 98765 43210"
              placeholderTextColor="#C4BEB8"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others a bit about yourself..."
              placeholderTextColor="#C4BEB8"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.charCount}>{bio.length}/200</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, (saving || verifyingOtp || resendingOtp) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving || verifyingOtp || resendingOtp}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {saving ? (hasEmailChange ? "Sending code..." : "Saving...") : "Save changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={verificationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!verifyingOtp && !resendingOtp) {
            setVerificationVisible(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.verifyCard}>
            <Text style={styles.verifyTitle}>Verify New Email</Text>
            <Text style={styles.verifyBody}>
              Enter the 6-digit code sent to{" "}
              <Text style={styles.verifyEmail}>{pendingEmail || normalizedEmail}</Text>.
            </Text>

            <TextInput
              style={styles.verifyInput}
              value={otpCode}
              onChangeText={(text) => {
                setOtpCode(text.replace(/[^0-9]/g, "").slice(0, 6));
                if (otpError) setOtpError("");
              }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              placeholder="Enter 6-digit code"
              placeholderTextColor="#A6A09A"
              editable={!verifyingOtp}
              maxLength={6}
              autoFocus
            />

            {otpError ? <Text style={styles.verifyError}>{otpError}</Text> : null}

            <TouchableOpacity
              style={[
                styles.verifyBtn,
                (otpCode.length < 6 || verifyingOtp) && styles.verifyBtnDisabled,
              ]}
              onPress={handleVerifyOtp}
              disabled={otpCode.length < 6 || verifyingOtp}
              activeOpacity={0.8}
            >
              <Text style={styles.verifyBtnText}>
                {verifyingOtp ? "Verifying..." : "Verify code"}
              </Text>
            </TouchableOpacity>

            <View style={styles.verifyFooter}>
              {cooldown > 0 ? (
                <Text style={styles.verifyHint}>Resend available in {cooldown}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResendOtp} disabled={resendingOtp}>
                  <Text style={styles.resendText}>
                    {resendingOtp ? "Sending..." : "Resend code"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.closeVerifyBtn}
              onPress={() => setVerificationVisible(false)}
              disabled={verifyingOtp || resendingOtp}
            >
              <Text style={styles.closeVerifyText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAF8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ECE7DE",
    backgroundColor: "#fff",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECE7DE",
    backgroundColor: "#FAFAF8",
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#1A1A1A" },
  content: { padding: 20, paddingBottom: 40 },
  avatarWrapper: { alignSelf: "center", marginBottom: 6 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#ECE7DE",
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F0EDE8",
    borderWidth: 2,
    borderColor: "#ECE7DE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontSize: 26, fontWeight: "700", color: "#1A1A1A" },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarHint: {
    textAlign: "center",
    fontSize: 13,
    color: "#A6A09A",
    marginBottom: 24,
  },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", color: "#6B6560", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECE7DE",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1A1A",
  },
  bioInput: { height: 90, textAlignVertical: "top", paddingTop: 12 },
  charCount: { fontSize: 12, color: "#C4BEB8", textAlign: "right", marginTop: 4 },
  saveBtn: {
    marginTop: 8,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveBtnDisabled: { backgroundColor: "#A6A09A" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  verifyCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  verifyTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A" },
  verifyBody: { marginTop: 8, fontSize: 14, lineHeight: 20, color: "#6B6560" },
  verifyEmail: { fontWeight: "700", color: "#1A1A1A" },
  verifyInput: {
    marginTop: 18,
    backgroundColor: "#FAFAF8",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECE7DE",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    letterSpacing: 4,
    textAlign: "center",
  },
  verifyError: { marginTop: 10, fontSize: 13, color: "#B42318", textAlign: "center" },
  verifyBtn: {
    marginTop: 18,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  verifyBtnDisabled: { backgroundColor: "#A6A09A" },
  verifyBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  verifyFooter: { marginTop: 14, alignItems: "center" },
  verifyHint: { fontSize: 13, color: "#A6A09A" },
  resendText: { fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
  closeVerifyBtn: { marginTop: 14, alignItems: "center" },
  closeVerifyText: { fontSize: 14, color: "#6B6560", fontWeight: "600" },
});
