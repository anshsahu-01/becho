import { View } from "react-native";
import { Image } from "expo-image";

type BrandMarkProps = {
  subtitle?: string;
  size?: number;
};

export function BrandMark({ subtitle: _subtitle, size = 132 }: BrandMarkProps) {
  return (
    <View className="items-center">
      <View style={{ width: size, height: size * 0.42 }} className="overflow-hidden">
        <Image
          source={require("../assets/logo.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
        />
      </View>
    </View>
  );
}