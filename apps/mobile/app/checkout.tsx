import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { formatPrice } from "@/utils/format";

const PAYMENT_OPTIONS = ["Cash on pickup", "UPI transfer", "Card at meetup"];

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{
    subtotal?: string;
    shipping?: string;
    total?: string;
    items?: string;
  }>();
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_OPTIONS[0]);

  const amounts = useMemo(() => {
    const subtotal = Number(params.subtotal ?? 0);
    const shipping = Number(params.shipping ?? 0);
    const total = Number(params.total ?? subtotal + shipping);
    const items = Number(params.items ?? 0);

    return { subtotal, shipping, total, items };
  }, [params.items, params.shipping, params.subtotal, params.total]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Checkout" showBack />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className="rounded-2xl border border-line bg-white p-4">
          <Text className="text-[18px] font-semibold text-ink">Order details</Text>
          <Text className="mt-2 text-[14px] text-muted">
            {amounts.items} item{amounts.items === 1 ? "" : "s"} selected for campus pickup.
          </Text>
        </View>

        <View className="mt-4 rounded-2xl border border-line bg-white p-4">
          <Text className="text-[16px] font-semibold text-ink">Pickup</Text>
          <Text className="mt-2 text-[14px] text-muted">
            Main college gate meetup. Seller will confirm the exact spot in chat.
          </Text>
        </View>

        <View className="mt-4 rounded-2xl border border-line bg-white p-4">
          <Text className="mb-3 text-[16px] font-semibold text-ink">Payment method</Text>
          {PAYMENT_OPTIONS.map((option, index) => {
            const active = paymentMethod === option;

            return (
              <Pressable
                key={option}
                onPress={() => setPaymentMethod(option)}
                className="flex-row items-center justify-between rounded-2xl border border-line px-4 py-3"
                style={{ marginBottom: index === PAYMENT_OPTIONS.length - 1 ? 0 : 10 }}
              >
                <Text className="text-[14px] text-ink">{option}</Text>
                <View
                  className={active ? "h-4 w-4 rounded-full bg-danger" : "h-4 w-4 rounded-full border border-line"}
                />
              </Pressable>
            );
          })}
        </View>

        <View className="mt-4 rounded-2xl border border-line bg-white p-4">
          <Text className="mb-3 text-[16px] font-semibold text-ink">Summary</Text>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[14px] text-muted">Subtotal</Text>
            <Text className="text-[14px] text-ink">{formatPrice(amounts.subtotal)}</Text>
          </View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[14px] text-muted">Shipping</Text>
            <Text className="text-[14px] text-ink">{formatPrice(amounts.shipping)}</Text>
          </View>
          <View className="my-3 h-px bg-line" />
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[16px] font-semibold text-ink">Total</Text>
            <Text className="text-[16px] font-semibold text-ink">{formatPrice(amounts.total)}</Text>
          </View>
          <Pressable
            onPress={() => Alert.alert("UI only", "Checkout styling is ready. Ordering logic was left untouched.")}
            className="h-12 items-center justify-center rounded-2xl bg-ink"
          >
            <Text className="text-[15px] font-medium text-white">Place order</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
