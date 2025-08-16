"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { awsConfig } from "@/lib/aws/config";

interface WebSocketMessage {
  action: string;
  roomId?: string;
  message?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  sendMessage: (message: WebSocketMessage) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

export const useWebSocket = (
  onMessageReceived?: (message: Record<string, unknown>) => void
): UseWebSocketReturn => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const idToken = localStorage.getItem("idToken");

    if (!isAuthenticated || !idToken || !awsConfig.websocketUrl) {
      console.log("Cannot connect: missing auth or WebSocket URL");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    try {
      console.log("Connecting to WebSocket:", awsConfig.websocketUrl);

      // Add auth token as query parameter
      const wsUrl = `${
        awsConfig.websocketUrl
      }?Authorization=${encodeURIComponent(idToken)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          if (onMessageReceived) {
            onMessageReceived(data);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect if it wasn't a normal closure
        if (
          event.code !== 1000 && // Normal closure
          reconnectAttempts.current < maxReconnectAttempts &&
          isAuthenticated
        ) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            10000
          );
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${
              reconnectAttempts.current + 1
            })`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("WebSocket connection failed");
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionError(
        error instanceof Error ? error.message : "Connection failed"
      );
    }
  }, [isAuthenticated, onMessageReceived]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }

    setIsConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("Sending WebSocket message:", message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, cannot send message:", message);
    }
  }, []);

  const joinRoom = useCallback(
    (roomId: string) => {
      sendMessage({
        action: "joinRoom",
        roomId,
      });
    },
    [sendMessage]
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      sendMessage({
        action: "leaveRoom",
        roomId,
      });
    },
    [sendMessage]
  );

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    joinRoom,
    leaveRoom,
  };
};
