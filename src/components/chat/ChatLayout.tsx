'use client';

import { ReactNode } from 'react';

interface ChatLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function ChatLayout({ children, sidebar }: ChatLayoutProps) {
  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">DynamoTalk</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebar}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
} 