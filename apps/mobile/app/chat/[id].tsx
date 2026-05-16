import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingState } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuth } from "@/hooks/useAuth";
import * as chatService from "@/services/chat.service";
import { ApiError } from "@/services/api";
import { ChatMessage, ConversationDetail } from "@/types";
import { formatMessageTime } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const loadMessages = useCallback(async () => {
    if (!id || !token) return;
    try {
      const data = await chatService.getConversationMessages(id, token);
      setConversation(data);
    } catch {
      setConversation(null);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (conversation?.messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [conversation?.messages.length]);

  const handleSend = async () => {
    if (!id || !token || !text.trim()) return;
    const content = text.trim();
    setText("");
    try {
      setSending(true);
      const message = await chatService.sendMessage(id, content, token);
      setConversation((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, message] }
          : prev
      );
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (err) {
      setText(content);
      Alert.alert(
        "Send failed",
        err instanceof ApiError ? err.message : "Could not send message"
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingState />;

  if (!conversation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScreenHeader title="Chat" showBack />
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Conversation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader
        title={conversation.otherUser.name}
        showBack
      />
      <Text className="border-b border-line px-4 pb-2 text-[12px] text-muted" numberOfLines={1}>
        {conversation.productTitle}
      </Text>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={listRef}
          className="flex-1 px-3 py-2"
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              className={cn(
                "mb-2 max-w-[80%]",
                item.isMine ? "self-end" : "self-start"
              )}
            >
              <View
                className={cn(
                  "rounded-2xl px-3 py-2",
                  item.isMine ? "bg-ink" : "bg-canvas"
                )}
              >
                <Text
                  className={cn(
                    "text-[15px]",
                    item.isMine ? "text-white" : "text-ink"
                  )}
                >
                  {item.content}
                </Text>
              </View>
              <Text
                className={cn(
                  "mt-0.5 text-[10px] text-faint",
                  item.isMine ? "text-right" : "text-left"
                )}
              >
                {formatMessageTime(item.createdAt)}
              </Text>
            </View>
          )}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View className="flex-1 items-center py-10">
              <Text className="text-[14px] text-muted">Send a message to start</Text>
            </View>
          }
        />

        <View className="flex-row items-end gap-2 border-t border-line bg-white p-3">
          <TextInput
            className="max-h-24 min-h-[40px] flex-1 rounded-full border border-line bg-canvas px-4 py-2 text-[15px] text-ink"
            placeholder="Type a message..."
            placeholderTextColor="#999999"
            value={text}
            onChangeText={setText}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={sending || !text.trim()}
            className={cn(
              "h-10 items-center justify-center rounded-full bg-ink px-4",
              (!text.trim() || sending) && "opacity-50"
            )}
          >
            <Text className="text-[14px] font-semibold text-white">Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
