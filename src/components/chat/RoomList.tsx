"use client";

import { Room } from "@/types";

interface RoomListProps {
  rooms: Room[];
  currentRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  onCreateRoom?: () => void;
}

export default function RoomList({
  rooms,
  currentRoom,
  onRoomSelect,
  onCreateRoom,
}: RoomListProps) {
  return (
    <div className='p-4 space-y-2'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>Rooms</h2>
        <button
          onClick={onCreateRoom}
          className='text-blue-600 hover:text-blue-700 text-sm font-medium'
        >
          + New
        </button>
      </div>

      <div className='space-y-1'>
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onRoomSelect(room)}
              className={`
                p-3 rounded-lg cursor-pointer transition-colors
                ${
                  currentRoom?.id === room.id
                    ? "bg-blue-100 border-blue-200 border"
                    : "hover:bg-gray-50 border border-transparent"
                }
              `}
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-sm font-medium text-gray-900 truncate'>
                    {room.name}
                  </h3>
                  {room.lastMessage && (
                    <p className='text-xs text-gray-500 truncate mt-1'>
                      {room.lastMessage.content}
                    </p>
                  )}
                </div>
                <div className='flex flex-col items-end ml-2'>
                  <span
                    className={`
                    inline-block w-2 h-2 rounded-full
                    ${room.type === "direct" ? "bg-green-400" : "bg-blue-400"}
                  `}
                  />
                  <span className='text-xs text-gray-400 mt-1'>
                    {room.members.length}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <p className='text-sm'>No rooms yet</p>
            <p className='text-xs mt-1'>
              Create your first room to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
