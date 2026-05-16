import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyListingCard } from "@/components/MyListingCard";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import * as productService from "@/services/product.service";
import { ApiError } from "@/services/api";
import { Product } from "@/types";

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const [active, setActive] = useState<Product[]>([]);
  const [sold, setSold] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = useCallback(
    async (isRefresh = false) => {
      if (!token) return;
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        const data = await productService.getMyProducts(token);
        setActive(data.active);
        setSold(data.sold);
      } catch {
        setActive([]);
        setSold([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings])
  );

  const handleMarkSold = async (productId: string) => {
    if (!token) return;
    try {
      await productService.updateProductStatus(productId, "SOLD", token);
      await loadListings(true);
    } catch (err) {
      Alert.alert(
        "Failed",
        err instanceof ApiError ? err.message : "Could not update status"
      );
    }
  };

  const handleDelete = async (productId: string) => {
    if (!token) return;
    try {
      await productService.deleteProduct(productId, token);
      await loadListings(true);
    } catch (err) {
      Alert.alert(
        "Failed",
        err instanceof ApiError ? err.message : "Could not delete listing"
      );
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadListings(true)} />
        }
      >
        <View className="border-b border-line px-4 py-3">
          <Text className="text-[20px] font-bold text-ink">Profile</Text>
        </View>

        <View className="border-b border-line p-4">
          <Text className="text-[17px] font-semibold text-ink">{user?.name}</Text>
          <Text className="mt-1 text-[14px] text-muted">{user?.email}</Text>
          {user?.collegeName ? (
            <Text className="mt-1 text-[13px] text-faint">{user.collegeName}</Text>
          ) : null}
        </View>

        <View className="border-b border-line px-4 py-3">
          <Text className="text-[16px] font-semibold text-ink">My listings</Text>
        </View>

        <Text className="bg-canvas px-4 py-2 text-[13px] font-semibold text-muted">
          Active ({active.length})
        </Text>
        {active.length === 0 ? (
          <Text className="px-4 py-4 text-[14px] text-muted">No active listings</Text>
        ) : (
          active.map((product) => (
            <MyListingCard
              key={product.id}
              product={product}
              showMarkSold
              onMarkSold={() => handleMarkSold(product.id)}
              onDelete={() => handleDelete(product.id)}
            />
          ))
        )}

        <Text className="bg-canvas px-4 py-2 text-[13px] font-semibold text-muted">
          Sold ({sold.length})
        </Text>
        {sold.length === 0 ? (
          <Text className="px-4 py-4 text-[14px] text-muted">No sold listings</Text>
        ) : (
          sold.map((product) => (
            <MyListingCard
              key={product.id}
              product={product}
              showMarkSold={false}
              onDelete={() => handleDelete(product.id)}
            />
          ))
        )}

        <View className="p-4">
          <Pressable
            onPress={logout}
            className="h-11 items-center justify-center rounded-md border border-line"
          >
            <Text className="text-[15px] font-semibold text-ink">Log out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
