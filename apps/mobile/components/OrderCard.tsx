import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Order, OrderStatus } from "@/types";
import { formatDate, formatPrice } from "@/utils/format";

type OrderCardProps = {
  order: Order;
  isSeller?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onShip?: () => void;
  onDeliver?: () => void;
  loading?: boolean;
};

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "text-warning";
    case "processing":
      return "text-success";
    case "shipped":
      return "text-ink";
    case "delivered":
      return "text-success";
    case "cancelled":
      return "text-danger";
    default:
      return "text-muted";
  }
}

export function OrderCard({
  order,
  isSeller,
  onConfirm,
  onCancel,
  onShip,
  onDeliver,
  loading,
}: OrderCardProps) {
  const canConfirm = Boolean(isSeller && order.orderStatus === "pending" && onConfirm);
  const canShip = Boolean(isSeller && order.orderStatus === "processing" && onShip);
  const canDeliver = Boolean(isSeller && order.orderStatus === "shipped" && onDeliver);
  const canCancel = Boolean(
    order.orderStatus !== "shipped" &&
      order.orderStatus !== "delivered" &&
      order.orderStatus !== "cancelled" &&
      onCancel
  );

  return (
    <View className="flex-row items-center gap-3 border-b border-line p-4 last:border-b-0">
      {order.product.images?.[0] ? (
        <Image
          source={{ uri: order.product.images[0] }}
          className="h-16 w-16 rounded-xl bg-white"
          contentFit="cover"
        />
      ) : (
        <View className="h-16 w-16 rounded-xl border border-line bg-white" />
      )}
      <View className="flex-1">
        <Text className="text-[15px] font-medium text-ink" numberOfLines={1}>
          {order.product.title}
        </Text>
        <Text className="mt-1 text-[13px] text-muted">
          {formatDate(order.createdAt)} | {order.paymentMethod}
        </Text>
        <Text className={`mt-1 text-[13px] font-medium capitalize ${getStatusColor(order.orderStatus)}`}>
          {order.orderStatus.replace("_", " ")}
        </Text>
      </View>
      <View className="items-end justify-center">
        <Text className="text-[16px] font-semibold text-ink">{formatPrice(order.amount)}</Text>
      </View>
      {canConfirm || canShip || canDeliver || canCancel ? (
        <View className="ml-2 gap-2">
          {canConfirm ? (
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className={`items-center justify-center rounded-lg bg-success px-3 py-1.5 ${loading ? "opacity-50" : ""}`}
            >
              <Text className="text-[12px] font-medium text-white">Confirm</Text>
            </Pressable>
          ) : null}
          {canShip ? (
            <Pressable
              onPress={onShip}
              disabled={loading}
              className={`items-center justify-center rounded-lg bg-ink px-3 py-1.5 ${loading ? "opacity-50" : ""}`}
            >
              <Text className="text-[12px] font-medium text-white">Mark Shipped</Text>
            </Pressable>
          ) : null}
          {canDeliver ? (
            <Pressable
              onPress={onDeliver}
              disabled={loading}
              className={`items-center justify-center rounded-lg bg-success px-3 py-1.5 ${loading ? "opacity-50" : ""}`}
            >
              <Text className="text-[12px] font-medium text-white">Delivered</Text>
            </Pressable>
          ) : null}
          {canCancel ? (
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className={`items-center justify-center rounded-lg border border-danger px-3 py-1.5 ${loading ? "opacity-50" : ""}`}
            >
              <Text className="text-[12px] font-medium text-danger">
                {isSeller ? "Cancel Sale" : "Cancel Order"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
