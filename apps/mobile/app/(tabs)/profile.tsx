import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="border-b border-line px-4 py-3">
        <Text className="text-[20px] font-bold text-ink">Profile</Text>
      </View>

      <View className="border-b border-line p-4">
        <Text className="text-[17px] font-semibold text-ink">{user?.name}</Text>
        <Text className="mt-1 text-[14px] text-muted">{user?.email}</Text>
        {user?.collegeName ? (
          <Text className="mt-1 text-[13px] text-faint">{user.collegeName}</Text>
        ) : null}
        {user?.isVerified ? (
          <Text className="mt-2 self-start rounded bg-verifiedBg px-2 py-0.5 text-[11px] text-verified">
            Verified
          </Text>
        ) : null}
      </View>

      <View className="p-4">
        <Pressable
          onPress={logout}
          className="h-11 items-center justify-center rounded-md border border-line"
        >
          <Text className="text-[15px] font-semibold text-ink">Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
