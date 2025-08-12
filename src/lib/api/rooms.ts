import { Room, ApiResponse } from "@/types";
import { awsConfig } from "@/lib/aws/config";

const API_BASE_URL = awsConfig.apiUrl;

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const idToken = localStorage.getItem("idToken");
  return {
    "Content-Type": "application/json",
    ...(idToken && { Authorization: `Bearer ${idToken}` }),
  };
};

// Helper function to handle API responses
const handleApiResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  try {
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to parse response",
    };
  }
};

// Get all rooms for the authenticated user
export const getRooms = async (): Promise<ApiResponse<Room[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    return await handleApiResponse<Room[]>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

// Create a new room
export const createRoom = async (roomData: {
  name: string;
  description?: string;
  type?: "group" | "direct";
}): Promise<ApiResponse<Room>> => {
  try {
    console.log("API: Creating room with data:", roomData);
    console.log("API: Using base URL:", API_BASE_URL);
    console.log("API: Auth headers:", getAuthHeaders());

    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData),
    });

    console.log("API: Response status:", response.status);
    console.log(
      "API: Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const result = await handleApiResponse<Room>(response);
    console.log("API: Final result:", result);

    return result;
  } catch (error) {
    console.error("API: Network error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

// Join a room
export const joinRoom = async (
  roomId: string
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    return await handleApiResponse<{ message: string }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

// Get room details (if needed later)
export const getRoom = async (roomId: string): Promise<ApiResponse<Room>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    return await handleApiResponse<Room>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};
