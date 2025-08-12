import { Message, ApiResponse } from "@/types";
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

// Get messages for a room
export const getMessages = async (
  roomId: string,
  limit?: number,
  lastKey?: string
): Promise<
  ApiResponse<{
    messages: Message[];
    hasMore: boolean;
    lastKey?: string;
  }>
> => {
  try {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (lastKey) params.append("lastKey", lastKey);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/rooms/${roomId}/messages${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    return await handleApiResponse<{
      messages: Message[];
      hasMore: boolean;
      lastKey?: string;
    }>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

// Send a message to a room
export const sendMessage = async (
  roomId: string,
  messageData: {
    content: string;
    messageType?: "text" | "image" | "file";
    attachments?: any[];
  }
): Promise<ApiResponse<Message>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData),
    });

    return await handleApiResponse<Message>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};
