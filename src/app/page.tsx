"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import ChatLayout from "@/components/chat/ChatLayout";
import RoomList from "@/components/chat/RoomList";
import MessageArea from "@/components/chat/MessageArea";
import { Room, Message } from "@/types";

// Mock data for demonstration

const mockRooms: Room[] = [
  {
    id: "room-1",
    name: "General",
    description: "General discussion",
    type: "group",
    createdBy: "user-1",
    members: ["user-1", "user-2", "user-3"],
    createdAt: new Date().toISOString(),
    lastMessage: {
      id: "msg-1",
      roomId: "room-1",
      userId: "user-2",
      content: "Hey everyone! Welcome to DynamoTalk",
      messageType: "text",
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: "room-2",
    name: "Development",
    description: "Development discussions",
    type: "group",
    createdBy: "user-1",
    members: ["user-1", "user-2"],
    createdAt: new Date().toISOString(),
    lastMessage: {
      id: "msg-2",
      roomId: "room-2",
      userId: "user-1",
      content: "The serverless setup is looking great!",
      messageType: "text",
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: "room-3",
    name: "Direct Message",
    type: "direct",
    createdBy: "user-2",
    members: ["user-1", "user-2"],
    createdAt: new Date().toISOString(),
  },
];

const mockMessages: { [roomId: string]: Message[] } = {
  "room-1": [
    {
      id: "msg-1",
      roomId: "room-1",
      userId: "user-2",
      content: "Hey everyone! Welcome to DynamoTalk",
      messageType: "text",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "msg-2",
      roomId: "room-1",
      userId: "user-1",
      content: "Thanks! This looks amazing. Love the Tailwind CSS styling.",
      messageType: "text",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "msg-3",
      roomId: "room-1",
      userId: "user-3",
      content: "The AWS serverless architecture is really impressive!",
      messageType: "text",
      createdAt: new Date(Date.now() - 900000).toISOString(),
    },
  ],
  "room-2": [
    {
      id: "msg-4",
      roomId: "room-2",
      userId: "user-1",
      content: "The serverless setup is looking great!",
      messageType: "text",
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: "msg-5",
      roomId: "room-2",
      userId: "user-2",
      content: "DynamoDB tables are all configured. Ready for the next phase!",
      messageType: "text",
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
  ],
  "room-3": [],
};

export default function HomePage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(mockRooms[0]);
  const [messages, setMessages] = useState<{ [roomId: string]: Message[] }>(
    mockMessages
  );

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  const handleRoomSelect = (room: Room) => {
    setCurrentRoom(room);
  };

  const handleSendMessage = (content: string) => {
    if (!currentRoom || !user) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      roomId: currentRoom.id,
      userId: user.id,
      content,
      messageType: "text",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [currentRoom.id]: [...(prev[currentRoom.id] || []), newMessage],
    }));
  };

  const currentMessages = currentRoom ? messages[currentRoom.id] || [] : [];

  return (
    <ChatLayout
      sidebar={
        <RoomList
          rooms={mockRooms}
          currentRoom={currentRoom}
          onRoomSelect={handleRoomSelect}
        />
      }
    >
      <MessageArea
        room={currentRoom}
        messages={currentMessages}
        currentUser={user}
        onSendMessage={handleSendMessage}
      />
    </ChatLayout>
  );
}
