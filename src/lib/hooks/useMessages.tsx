"use client";

import { useState, useCallback } from "react";
import { Message } from "@/types";
import { getMessages, sendMessage } from "@/lib/api/messages";
import { useWebSocket } from "./useWebSocket";

interface UseMessagesReturn {
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  loadMessages: (roomId: string) => Promise<void>;
  sendNewMessage: (roomId: string, content: string) => Promise<boolean>;
  refreshMessages: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback(
    (data: Record<string, unknown>) => {
      console.log("Received WebSocket message:", data);

      if (data.type === "message" && data.message) {
        const newMessage: Message = data.message as Message;
        setMessages((prev) => ({
          ...prev,
          [newMessage.roomId]: [...(prev[newMessage.roomId] || []), newMessage],
        }));
      }
    },
    []
  );

  const { isConnected, joinRoom, leaveRoom } = useWebSocket(
    handleWebSocketMessage
  );

  const loadMessages = useCallback(async (roomId: string) => {
    if (!roomId) return;

    console.log("Loading messages for room:", roomId);
    setLoading(true);
    setError(null);

    try {
      const response = await getMessages(roomId, 50);
      console.log("Messages API response:", response);

      if (response.success && response.data) {
        setMessages((prev) => ({
          ...prev,
          [roomId]: response.data!.messages.reverse(), // Reverse to show chronological order
        }));
        console.log(
          "Messages loaded successfully:",
          response.data.messages.length
        );
      } else {
        setError(response.error || "Failed to load messages");
        console.error("Failed to load messages:", response.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      console.error("Messages loading error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendNewMessage = useCallback(
    async (roomId: string, content: string): Promise<boolean> => {
      if (!roomId || !content.trim()) return false;

      console.log("Sending message to room:", roomId, "content:", content);
      setError(null);

      try {
        const response = await sendMessage(roomId, {
          content: content.trim(),
          messageType: "text",
        });
        console.log("Send message API response:", response);

        if (response.success && response.data) {
          // Add the new message to the local state
          setMessages((prev) => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), response.data!],
          }));
          console.log("Message sent successfully:", response.data.id);
          return true;
        } else {
          setError(response.error || "Failed to send message");
          console.error("Failed to send message:", response.error);
          return false;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        console.error("Message sending error:", error);
        return false;
      }
    },
    []
  );

  const refreshMessages = useCallback(
    async (roomId: string) => {
      await loadMessages(roomId);
    },
    [loadMessages]
  );

  return {
    messages,
    loading,
    error,
    isConnected,
    loadMessages,
    sendNewMessage,
    refreshMessages,
    joinRoom,
    leaveRoom,
  };
};
