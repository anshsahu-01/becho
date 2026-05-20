import { ApiResponse, Order, OrderStatus, PaymentMethod, PaymentStatus } from "@/types";
import { apiRequest } from "./api";

export type OrderActionStatus = PaymentStatus | Extract<OrderStatus, "shipped" | "delivered">;

export async function createOrder(
  productId: string,
  paymentMethod: PaymentMethod,
  mobileNumber: string,
  deliveryAddress: string,
  token: string
) {
  const res = await apiRequest<ApiResponse<Order>>("/orders", {
    method: "POST",
    body: {
      productId,
      paymentMethod,
      mobileNumber,
      deliveryAddress,
      locationDetails: deliveryAddress,
    },
    token,
  });
  return res.data;
}

export async function getMyOrders(token: string) {
  const res = await apiRequest<ApiResponse<Order[]>>("/orders/my-orders", {
    token,
  });
  return res.data;
}

export async function getMySales(token: string) {
  const res = await apiRequest<ApiResponse<Order[]>>("/orders/my-sales", {
    token,
  });
  return res.data;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderActionStatus,
  token: string
) {
  const res = await apiRequest<ApiResponse<Order>>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: { status },
    token,
  });
  return res.data;
}
