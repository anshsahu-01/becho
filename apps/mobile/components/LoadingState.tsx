import { ActivityIndicator, View } from "react-native";

export function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#1A1A1A" />
    </View>
  );
}
