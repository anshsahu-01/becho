import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Product } from "@/types";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/cn";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const imageUri = product.images?.[0];
  const isSold = product.isSold;

  return (
    <Pressable
      className={cn(
        "flex-row gap-3 border-b border-line bg-white p-3",
        isSold && "opacity-60"
      )}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View className="relative">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="h-[100px] w-[100px] rounded bg-canvas"
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="h-[100px] w-[100px] items-center justify-center rounded bg-canvas">
            <Text className="text-[13px] text-faint">No photo</Text>
          </View>
        )}
        {isSold ? (
          <View className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5">
            <Text className="text-[10px] font-bold text-white">SOLD</Text>
          </View>
        ) : null}
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-lg font-bold text-ink">{formatPrice(product.price)}</Text>
        <Text className="mt-0.5 text-[15px] leading-5 text-ink" numberOfLines={2}>
          {product.title}
        </Text>
        <Text className="mt-0.5 text-[13px] text-muted" numberOfLines={1}>
          {product.category?.name ?? "—"} · {product.condition}
        </Text>
        {product.seller?.collegeName ? (
          <Text className="mt-0.5 text-[13px] text-faint" numberOfLines={1}>
            {product.seller.collegeName}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
