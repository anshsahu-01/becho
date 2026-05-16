import { Text, View } from "react-native";
import { Image } from "expo-image";
import { Seller } from "@/types";

type SellerRowProps = {
  seller: Seller;
};

export function SellerRow({ seller }: SellerRowProps) {
  return (
    <View className="flex-row items-center gap-3 border-t border-line p-4">
      <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-canvas">
        {seller.profileImage ? (
          <Image source={{ uri: seller.profileImage }} className="h-11 w-11" />
        ) : (
          <Text className="text-[17px] font-semibold text-muted">
            {seller.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-[15px] font-semibold text-ink">{seller.name}</Text>
          {seller.isVerified ? (
            <Text className="rounded bg-verifiedBg px-1.5 py-0.5 text-[11px] text-verified">
              Verified
            </Text>
          ) : null}
        </View>
        {seller.collegeName ? (
          <Text className="mt-0.5 text-[13px] text-muted">{seller.collegeName}</Text>
        ) : null}
      </View>
    </View>
  );
}
