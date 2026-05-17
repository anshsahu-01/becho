import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/utils/format";

export default function CartScreen() {
  const { products, loading } = useProducts({
    sort: "latest",
    limit: 2,
  });
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  useEffect(() => {
    setQuantities((current) => {
      const next = { ...current };
      products.forEach((product) => {
        if (!next[product.id]) {
          next[product.id] = 1;
        }
      });
      return next;
    });
  }, [products]);

  const cartItems = useMemo(
    () => products.filter((product) => !removedIds.includes(product.id)),
    [products, removedIds]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.price * (quantities[item.id] ?? 1),
        0
      ),
    [cartItems, quantities]
  );

  const shipping = cartItems.length > 0 ? 49 : 0;
  const total = subtotal + shipping;

  if (loading && products.length === 0) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="My Cart" showBack />

      {cartItems.length === 0 ? (
        <EmptyState message="Your cart is empty right now." />
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: 180 }}
          >
            {cartItems.map((item) => (
              <View
                key={item.id}
                className="mb-4 rounded-2xl border border-line bg-white p-3"
              >
                <View className="flex-row gap-3">
                  {item.images?.[0] ? (
                    <Image
                      source={{ uri: item.images[0] }}
                      className="h-20 w-20 rounded-xl bg-white"
                      contentFit="cover"
                    />
                  ) : (
                    <View className="h-20 w-20 rounded-xl bg-white" />
                  )}

                  <View className="flex-1 justify-between">
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-1">
                        <Text className="text-[15px] font-medium leading-5 text-ink" numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text className="mt-1 text-[13px] text-muted">
                          {item.category.name} . {item.condition}
                        </Text>
                      </View>
                      <Pressable onPress={() => setRemovedIds((prev) => [...prev, item.id])}>
                        <Ionicons name="close-circle-outline" size={20} color="#FF4C3B" />
                      </Pressable>
                    </View>

                    <View className="mt-3 flex-row items-center justify-between">
                      <Text className="text-[18px] font-semibold text-ink">
                        {formatPrice(item.price)}
                      </Text>

                      <View className="flex-row items-center rounded-full border border-line bg-white px-2 py-1">
                        <Pressable
                          className="h-8 w-8 items-center justify-center"
                          onPress={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [item.id]: Math.max(1, (prev[item.id] ?? 1) - 1),
                            }))
                          }
                        >
                          <Ionicons name="remove" size={16} color="#111111" />
                        </Pressable>
                        <Text className="w-8 text-center text-[15px] font-medium text-ink">
                          {quantities[item.id] ?? 1}
                        </Text>
                        <Pressable
                          className="h-8 w-8 items-center justify-center"
                          onPress={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [item.id]: (prev[item.id] ?? 1) + 1,
                            }))
                          }
                        >
                          <Ionicons name="add" size={16} color="#111111" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 border-t border-line bg-white p-5">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[15px] text-muted">Subtotal</Text>
              <Text className="text-[16px] font-medium text-ink">{formatPrice(subtotal)}</Text>
            </View>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[15px] text-muted">Shipping</Text>
              <Text className="text-[16px] font-medium text-ink">{formatPrice(shipping)}</Text>
            </View>
            <View className="mb-4 h-px bg-line" />
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[18px] font-semibold text-ink">Total</Text>
              <Text className="text-[18px] font-semibold text-ink">{formatPrice(total)}</Text>
            </View>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/checkout",
                  params: {
                    subtotal: String(subtotal),
                    shipping: String(shipping),
                    total: String(total),
                    items: String(cartItems.length),
                  },
                })
              }
              className="h-12 items-center justify-center rounded-2xl bg-ink"
            >
              <Text className="text-[15px] font-medium text-white">Checkout</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
