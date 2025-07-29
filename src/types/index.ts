// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  lastSeen: string;
  isOnline: boolean;
}

// Room Types
export interface Room {
  id: string;
  name: string;
  description?: string;
  type: "direct" | "group";
  createdBy: string;
  members: string[];
  createdAt: string;
  lastMessage?: Message;
}

// Message Types
export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  messageType: "text" | "image" | "file";
  attachments?: Attachment[];
  createdAt: string;
  editedAt?: string;
  reactions?: Reaction[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface Reaction {
  emoji: string;
  userId: string;
  createdAt: string;
}

// WebSocket Connection Types
export interface Connection {
  connectionId: string;
  userId: string;
  roomId: string;
  connectedAt: string;
}

// Authentication Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Chat State Types
export interface ChatState {
  rooms: Room[];
  currentRoom: Room | null;
  messages: { [roomId: string]: Message[] };
  onlineUsers: string[];
  loading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: "message" | "user_joined" | "user_left" | "typing" | "reaction";
  data:
    | Message
    | User
    | { userId: string; messageId: string; emoji: string }
    | unknown;
  timestamp: string;
}

// Component Props Types
export interface ChatRoomProps {
  room: Room;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string) => void;
}

export interface MessageItemProps {
  message: Message;
  currentUser: User;
  onReaction?: (messageId: string, emoji: string) => void;
}

export interface RoomListProps {
  rooms: Room[];
  currentRoom: Room | null;
  onRoomSelect: (room: Room) => void;
}
