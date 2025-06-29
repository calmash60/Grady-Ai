import React from 'react';
import { ChatSession } from '../types';
import { PlusIcon, ChatBubbleIcon } from './icons';

interface SidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, activeChatId, onNewChat, onSelectChat }) => {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col p-4">
      <div className="text-2xl font-bold mb-6">Chat History</div>
      <button
        onClick={onNewChat}
        className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-6 transition-colors"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        New Chat
      </button>
      <div className="flex-1 overflow-y-auto -mr-2 pr-2">
        <ul className="space-y-2">
          {chats.slice().sort((a,b) => b.createdAt - a.createdAt).map(chat => (
            <li key={chat.id}>
              <button
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left p-3 rounded-lg flex items-center transition-colors ${
                  activeChatId === chat.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                }`}
              >
                <ChatBubbleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate flex-1">{chat.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
