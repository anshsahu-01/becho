import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  rightAction?: ReactNode;
};

export function ScreenHeader({ title, showBack, rightAction }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center border-b border-line bg-white px-4 py-3">
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-white"
        >
          <Ionicons name="chevron-back" size={20} color="#111111" />
        </Pressable>
      ) : (
        <View className="w-10" />
      )}
      <Text className="flex-1 text-center text-[18px] font-semibold text-ink" numberOfLines={1}>
        {title}
      </Text>
      <View className="min-w-[40px] items-end">{rightAction ?? <View className="w-10" />}</View>
    </View>
  );
}
