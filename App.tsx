import React, { useState, useEffect, useCallback } from 'react';
import { ChatSession, Message } from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';

const App: React.FC = () => {
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const savedChats = localStorage.getItem('chatSessions');
      return savedChats ? JSON.parse(savedChats) : [];
    } catch (error) {
      console.error("Failed to load chats from localStorage", error);
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('chatSessions', JSON.stringify(chats));
    } catch (error) {
      console.error("Failed to save chats to localStorage", error);
    }
  }, [chats]);
  
  useEffect(() => {
    if(!activeChatId && chats.length > 0) {
      const sortedChats = chats.slice().sort((a, b) => b.createdAt - a.createdAt);
      setActiveChatId(sortedChats[0].id);
    }
  }, [activeChatId, chats]);

  const createNewChat = useCallback(() => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, []);

  const selectChat = (id: string) => {
    setActiveChatId(id);
  };

  const updateChatSession = useCallback((sessionId: string, messages: Message[]) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === sessionId) {
          const newTitle = messages.length > 0 && chat.title === 'New Chat'
            ? messages[0].content.substring(0, 40) + (messages[0].content.length > 40 ? '...' : '')
            : chat.title;
          return { ...chat, messages, title: newTitle };
        }
        return chat;
      })
    );
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="flex h-screen font-sans">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
      />
      <main className="flex-1 h-full">
        {activeChat ? (
          <ChatView
            chatSession={activeChat}
            updateChatSession={updateChatSession}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white">
            <h1 className="text-3xl font-bold">Welcome to Grady's Assistant</h1>
            <p className="mt-2 text-gray-400">Start a new chat from the sidebar to begin.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
