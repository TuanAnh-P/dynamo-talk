"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Button from "@/components/ui/Button";

interface ChatLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function ChatLayout({ children, sidebar }: ChatLayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className='h-screen flex bg-gray-100'>
      {/* Sidebar */}
      <div className='w-80 bg-white border-r border-gray-200 flex flex-col'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h1 className='text-xl font-bold text-gray-900'>DynamoTalk</h1>
            <Button
              variant='ghost'
              size='sm'
              onClick={signOut}
              className='text-gray-500 hover:text-gray-700'
            >
              Sign Out
            </Button>
          </div>
          {user && (
            <div className='mt-2'>
              <p className='text-sm text-gray-600'>Welcome back,</p>
              <p className='text-sm font-medium text-gray-900'>
                {user.username}
              </p>
            </div>
          )}
        </div>
        <div className='flex-1 overflow-y-auto'>{sidebar}</div>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>{children}</div>
    </div>
  );
}
