import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import * as chatService from "@/services/chat.service";
import { ConversationListItem } from "@/types";
import { formatTimeAgo } from "@/utils/format";

export default function ChatsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = useCallback(
    async (isRefresh = false) => {
      if (!token) return;
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        const data = await chatService.getConversations(token);
        setConversations(data);
      } catch {
        setConversations([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats])
  );

  if (loading && conversations.length === 0) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="border-b border-line px-4 py-3">
        <Text className="text-[20px] font-bold text-ink">Chats</Text>
      </View>

      <FlatList
        className="flex-1"
        data={conversations}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadChats(true)} />
        }
        renderItem={({ item }) => (
          <Pressable
            className="flex-row gap-3 border-b border-line px-4 py-3"
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            {item.productImage ? (
              <Image
                source={{ uri: item.productImage }}
                className="h-14 w-14 rounded bg-canvas"
                contentFit="cover"
              />
            ) : (
              <View className="h-14 w-14 rounded bg-canvas" />
            )}
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-[15px] font-semibold text-ink" numberOfLines={1}>
                  {item.otherUser.name}
                </Text>
                <Text className="ml-2 text-[11px] text-faint">
                  {formatTimeAgo(item.lastMessageAt)}
                </Text>
              </View>
              <Text className="text-[13px] text-muted" numberOfLines={1}>
                {item.productTitle}
              </Text>
              <Text className="mt-0.5 text-[13px] text-faint" numberOfLines={1}>
                {item.lastMessage
                  ? `${item.lastMessage.isMine ? "You: " : ""}${item.lastMessage.content}`
                  : "No messages yet"}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState message="No conversations yet. Message a seller from a listing." />
        }
        contentContainerStyle={conversations.length === 0 ? { flexGrow: 1 } : undefined}
      />
    </SafeAreaView>
  );
}
