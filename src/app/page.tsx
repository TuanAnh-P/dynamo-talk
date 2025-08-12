"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRooms } from "@/lib/hooks/useRooms";
import { useMessages } from "@/lib/hooks/useMessages";
import ChatLayout from "@/components/chat/ChatLayout";
import RoomList from "@/components/chat/RoomList";
import MessageArea from "@/components/chat/MessageArea";
import { Room } from "@/types";

// Real chat application using AWS services

export default function HomePage() {
  const { isAuthenticated, user, loading } = useAuth();
  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    createNewRoom,
  } = useRooms();
  const {
    messages,
    error: messagesError,
    loadMessages,
    sendNewMessage,
  } = useMessages();
  const router = useRouter();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // Set first room as current when rooms load
  useEffect(() => {
    if (rooms.length > 0 && !currentRoom) {
      setCurrentRoom(rooms[0]);
    }
  }, [rooms, currentRoom]);

  // Load messages when current room changes
  useEffect(() => {
    if (currentRoom) {
      console.log("Loading messages for room:", currentRoom.id);
      loadMessages(currentRoom.id);
    }
  }, [currentRoom, loadMessages]);

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading spinner while checking authentication or loading rooms
  if (loading || roomsLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>
            {loading ? "Loading..." : "Loading rooms..."}
          </p>
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

  const handleSendMessage = async (content: string) => {
    if (!currentRoom || !user) return;

    console.log("Sending message:", content, "to room:", currentRoom.id);
    const success = await sendNewMessage(currentRoom.id, content);

    if (!success) {
      console.error("Failed to send message");
      // Could show a toast or error message here
    } else {
      console.log("Message sent successfully");
    }
  };

  const handleCreateRoom = async () => {
    const name = prompt("Enter room name:");
    if (name) {
      console.log("Creating room with name:", name);
      try {
        const success = await createNewRoom({ name, type: "group" });
        console.log("Room creation result:", success);
        if (!success) {
          console.error("Room creation failed");
        }
      } catch (error) {
        console.error("Room creation error:", error);
      }
    }
  };

  const currentMessages = currentRoom ? messages[currentRoom.id] || [] : [];

  // Show rooms error if there's one
  if (roomsError) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <div className='text-red-600 mb-4'>
            <p className='text-lg font-medium'>Error loading rooms</p>
            <p className='text-sm'>{roomsError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show messages error if there's one (but don't block the entire page)
  if (messagesError) {
    console.error("Messages error:", messagesError);
  }

  // Show empty state if no rooms
  if (rooms.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100'>
        <div className='text-center'>
          <p className='text-lg text-gray-600 mb-4'>No rooms found</p>
          <p className='text-sm text-gray-500 mb-6'>
            Create your first room to start chatting!
          </p>
          <button
            onClick={async () => {
              const name = prompt("Enter room name:");
              if (name) {
                console.log("Creating room with name:", name);
                try {
                  const success = await createNewRoom({ name, type: "group" });
                  console.log("Room creation result:", success);
                  if (!success) {
                    console.error("Room creation failed");
                  }
                } catch (error) {
                  console.error("Room creation error:", error);
                }
              }
            }}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Create Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatLayout
      sidebar={
        <RoomList
          rooms={rooms}
          currentRoom={currentRoom}
          onRoomSelect={handleRoomSelect}
          onCreateRoom={handleCreateRoom}
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
