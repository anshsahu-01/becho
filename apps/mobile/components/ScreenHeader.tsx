import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  rightAction?: ReactNode;
};

export function ScreenHeader({ title, showBack, rightAction }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center border-b border-line bg-white px-3 py-3">
      {showBack ? (
        <Pressable onPress={() => router.back()} className="h-9 w-9 justify-center">
          <Text className="text-[22px] text-ink">←</Text>
        </Pressable>
      ) : (
        <View className="w-9" />
      )}
      <Text className="flex-1 text-center text-[17px] font-semibold text-ink" numberOfLines={1}>
        {title}
      </Text>
      <View className="min-w-[36px] items-end">{rightAction ?? <View className="w-9" />}</View>
    </View>
  );
}
