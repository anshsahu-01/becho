import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { LoadingState } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SellerRow } from "@/components/SellerRow";
import { useAuth } from "@/hooks/useAuth";
import * as chatService from "@/services/chat.service";
import * as productService from "@/services/product.service";
import { ApiError } from "@/services/api";
import { Product } from "@/types";
import { formatDate, formatPrice } from "@/utils/format";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!id) return;
    try {
      setError("");
      const data = await productService.getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const isOwner = user?.id === product?.userId;
  const isSold =
    product?.status === "SOLD" || product?.isSold === true;

  const handleChat = async () => {
    if (!product || !token || isOwner) return;
    try {
      setChatLoading(true);
      const conversation = await chatService.createConversation(product.id, token);
      router.push(`/chat/${conversation.id}`);
    } catch (err) {
      Alert.alert(
        "Chat failed",
        err instanceof ApiError ? err.message : "Could not start chat"
      );
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScreenHeader title="Item" showBack />
        <View className="flex-1 items-center justify-center">
          <Text className="text-[15px] text-muted">{error || "Product not found"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="" showBack />
      <ScrollView className="flex-1">
        <View className="relative">
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {product.images.map((uri) => (
              <Image
                key={uri}
                source={{ uri }}
                style={{ width, height: 280 }}
                className="bg-canvas"
                contentFit="cover"
              />
            ))}
          </ScrollView>
          {isSold ? (
            <View className="absolute left-3 top-3 rounded bg-ink px-2 py-1">
              <Text className="text-[12px] font-bold text-white">SOLD</Text>
            </View>
          ) : null}
        </View>

        <View className="p-4">
          <Text className="mb-2 text-2xl font-bold text-ink">{formatPrice(product.price)}</Text>
          <Text className="mb-3 text-[20px] font-semibold leading-[26px] text-ink">
            {product.title}
          </Text>

          <View className="mb-2 flex-row flex-wrap gap-2">
            <Text className="rounded bg-canvas px-3 py-1 text-[13px] text-muted">
              {product.category.name}
            </Text>
            <Text className="rounded bg-canvas px-3 py-1 text-[13px] text-muted">
              {product.condition}
            </Text>
          </View>

          <Text className="text-[13px] text-faint">
            Posted {formatDate(product.createdAt)}
          </Text>

          <View className="my-4 h-px bg-line" />

          <Text className="mb-2 text-[15px] font-semibold text-ink">Description</Text>
          <Text className="text-[15px] leading-[22px] text-ink">{product.description}</Text>
        </View>

        <SellerRow seller={product.seller} />
      </ScrollView>

      {!isOwner && token && !isSold ? (
        <View className="border-t border-line bg-white p-3">
          <Button
            title="Message seller"
            onPress={handleChat}
            loading={chatLoading}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
