import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatSession, Message, Role } from '../types';
import { geminiService } from '../services/geminiService';
import MessageComponent from './Message';
import { SendIcon } from './icons';

interface ChatViewProps {
  chatSession: ChatSession;
  updateChatSession: (sessionId: string, messages: Message[]) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chatSession, updateChatSession }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatSession.messages]);
  
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: input,
    };

    const newMessages = [...chatSession.messages, userMessage];
    updateChatSession(chatSession.id, newMessages);
    setInput('');
    setIsLoading(true);

    const imagePromptKeywords = ['generate an image of', 'create an image of', 'draw a picture of', 'make a picture of'];
    const lowercasedInput = input.toLowerCase();
    const isImageRequest = imagePromptKeywords.some(keyword => lowercasedInput.startsWith(keyword));

    if (isImageRequest) {
      const prompt = input.substring(input.indexOf(' of ') + 4);
      const imageUrl = await geminiService.generateImage(prompt);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.AI,
        content: imageUrl,
        isImage: !imageUrl.startsWith('Sorry') && !imageUrl.startsWith("I couldn't"),
      };
      updateChatSession(chatSession.id, [...newMessages, aiMessage]);
    } else {
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessagePlaceholder: Message = {
        id: aiMessageId,
        role: Role.AI,
        content: '',
        isLoading: true,
      };
      updateChatSession(chatSession.id, [...newMessages, aiMessagePlaceholder]);
      
      let fullResponse = '';
      try {
        const stream = geminiService.generateTextStream(
          chatSession.id,
          chatSession.messages, // history
          input
        );
        for await (const chunk of stream) {
          fullResponse += chunk;
          updateChatSession(chatSession.id, [
            ...newMessages,
            { ...aiMessagePlaceholder, content: fullResponse, isLoading: true },
          ]);
        }
      } catch (error) {
        console.error('Streaming failed:', error);
        fullResponse = 'Sorry, I encountered an error. Please try again.';
      } finally {
        const finalAiMessage: Message = {
          id: aiMessageId,
          role: Role.AI,
          content: fullResponse || 'Sorry, I could not provide a response.',
        };
        updateChatSession(chatSession.id, [...newMessages, finalAiMessage]);
      }
    }

    setIsLoading(false);
  }, [input, isLoading, chatSession, updateChatSession]);

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <div className="flex-1 overflow-y-auto p-6">
        {chatSession.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
             <div className="text-4xl font-bold mb-2">Grady's Assistant</div>
             <p>Ask me anything, or try generating an image!</p>
             <p className="text-sm mt-2">e.g., "generate an image of a robot on a skateboard"</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {chatSession.messages.map(msg => (
              <MessageComponent key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="px-6 pb-6 bg-gray-800">
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative">
                <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as any);
                    }
                }}
                placeholder="Type your message here..."
                className="w-full bg-gray-700 text-white rounded-lg p-4 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '200px' }}
                disabled={isLoading}
                />
                <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                <SendIcon className="w-5 h-5 text-white" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
