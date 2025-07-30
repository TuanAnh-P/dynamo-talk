"use client";

import { useState } from "react";
import { Message, Room, User } from "@/types";
import Button from "@/components/ui/Button";

interface MessageAreaProps {
  room: Room | null;
  messages: Message[];
  currentUser: User | null;
  onSendMessage: (content: string) => void;
}

export default function MessageArea({
  room,
  messages,
  currentUser,
  onSendMessage,
}: MessageAreaProps) {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim() && room) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!room) {
    return (
      <div className='flex-1 flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>💬</div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Welcome to DynamoTalk
          </h2>
          <p className='text-gray-600'>Select a room to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col'>
      {/* Chat Header */}
      <div className='p-4 border-b border-gray-200 bg-white'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>{room.name}</h2>
            <p className='text-sm text-gray-600'>
              {room.members.length} member{room.members.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <span
              className={`
              inline-block w-3 h-3 rounded-full
              ${room.type === "direct" ? "bg-green-400" : "bg-blue-400"}
            `}
            />
            <span className='text-sm text-gray-600 capitalize'>
              {room.type}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.userId === currentUser?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                  max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                  ${
                    msg.userId === currentUser?.id
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }
                `}
              >
                {msg.userId !== currentUser?.id && (
                  <p className='text-xs text-gray-500 mb-1'>
                    User {msg.userId.slice(-4)}
                  </p>
                )}
                <p className='text-sm'>{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.userId === currentUser?.id
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center text-gray-500'>
              <p className='text-sm'>No messages yet</p>
              <p className='text-xs mt-1'>Start the conversation!</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className='p-4 border-t border-gray-200 bg-white'>
        <div className='flex space-x-2'>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${room.name}...`}
            className='flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size='md'
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
