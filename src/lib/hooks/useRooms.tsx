"use client";

import { useState, useEffect, useCallback } from "react";
import { Room } from "@/types";
import { getRooms, createRoom, joinRoom } from "@/lib/api/rooms";
import { useAuth } from "./useAuth";

interface UseRoomsReturn {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  refreshRooms: () => Promise<void>;
  createNewRoom: (roomData: {
    name: string;
    description?: string;
    type?: "group" | "direct";
  }) => Promise<boolean>;
  joinExistingRoom: (roomId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useRooms = (): UseRoomsReturn => {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms from API
  const refreshRooms = useCallback(async () => {
    if (!isAuthenticated) {
      setRooms([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getRooms();

      if (result.success && result.data) {
        setRooms(result.data);
      } else {
        setError(result.error || "Failed to load rooms");
        setRooms([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create a new room
  const createNewRoom = useCallback(
    async (roomData: {
      name: string;
      description?: string;
      type?: "group" | "direct";
    }): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        console.log("useRooms: Creating room with data:", roomData);
        const result = await createRoom(roomData);
        console.log("useRooms: Create room API result:", result);

        if (result.success && result.data) {
          // Add the new room to the list
          console.log("useRooms: Adding new room to list");
          setRooms((prev) => [result.data!, ...prev]);
          return true;
        } else {
          console.error("useRooms: Room creation failed:", result.error);
          setError(result.error || "Failed to create room");
          return false;
        }
      } catch (err) {
        console.error("useRooms: Exception during room creation:", err);
        setError(err instanceof Error ? err.message : "Failed to create room");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Join an existing room
  const joinExistingRoom = useCallback(
    async (roomId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await joinRoom(roomId);

        if (result.success) {
          // Refresh rooms to get updated list
          await refreshRooms();
          return true;
        } else {
          setError(result.error || "Failed to join room");
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join room");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refreshRooms]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load rooms when authentication changes
  useEffect(() => {
    refreshRooms();
  }, [refreshRooms]);

  return {
    rooms,
    loading,
    error,
    refreshRooms,
    createNewRoom,
    joinExistingRoom,
    clearError,
  };
};
