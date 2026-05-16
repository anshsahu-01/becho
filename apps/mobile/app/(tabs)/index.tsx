import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/utils/cn";

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" as const },
  { label: "Price ↑", value: "price_asc" as const },
  { label: "Price ↓", value: "price_desc" as const },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"latest" | "price_asc" | "price_desc">("latest");

  const { products, loading, refreshing, error, refetch, setFilters } = useProducts({
    sort: "latest",
    limit: 20,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const applySearch = () => {
    setFilters((prev) => ({ ...prev, search: search.trim() || undefined, sort }));
  };

  const changeSort = (value: typeof sort) => {
    setSort(value);
    setFilters((prev) => ({ ...prev, sort: value }));
  };

  if (loading && products.length === 0) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between border-b border-line px-4 py-3">
        <View>
          <Text className="text-[20px] font-bold text-ink">Becho</Text>
          {user?.collegeName ? (
            <Text className="mt-0.5 text-[13px] text-muted">{user.collegeName}</Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row gap-2 p-3">
        <TextInput
          className="h-10 flex-1 rounded-md border border-line bg-canvas px-3 text-[15px] text-ink"
          placeholder="Search items..."
          placeholderTextColor="#999999"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={applySearch}
          returnKeyType="search"
        />
        <Pressable
          className="h-10 justify-center rounded-md bg-ink px-4"
          onPress={applySearch}
        >
          <Text className="text-[15px] font-semibold text-white">Go</Text>
        </Pressable>
      </View>

      <View className="flex-row gap-2 px-3 pb-3">
        {SORT_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => changeSort(option.value)}
            className={cn(
              "rounded-full border border-line px-3 py-1.5",
              sort === option.value && "border-ink bg-ink"
            )}
          >
            <Text
              className={cn(
                "text-[13px] text-muted",
                sort === option.value && "font-semibold text-white"
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <View className="items-center p-3">
          <Text className="text-[13px] text-danger">{error}</Text>
          <Pressable onPress={refetch}>
            <Text className="mt-1 text-[13px] text-link">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        className="flex-1"
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState message="No listings yet. Be the first to sell." />
          ) : null
        }
        contentContainerStyle={products.length === 0 ? { flexGrow: 1 } : undefined}
      />
    </SafeAreaView>
  );
}
