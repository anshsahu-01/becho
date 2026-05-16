import { Text, View } from "react-native";

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-5">
      <Text className="text-center text-[15px] text-muted">{message}</Text>
    </View>
  );
}
