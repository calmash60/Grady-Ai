import React from 'react';
import { Message, Role } from '../types';
import CodeBlock from './CodeBlock';

interface MessageProps {
  message: Message;
}

const UserAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white flex-shrink-0">
    Y
  </div>
);

const AIAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
  </div>
);

const MessageContent: React.FC<{ content: string, isImage?: boolean }> = ({ content, isImage }) => {
  if (isImage) {
    return <img src={content} alt="Generated" className="rounded-lg max-w-sm" />;
  }

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div>
      {parts.map((part, index) => {
        const codeBlockRegex = /^```(\w+)?\n?([\s\S]*?)```$/;
        const match = part.match(codeBlockRegex);

        if (match) {
          const language = match[1] || 'plaintext';
          const code = match[2];
          return <CodeBlock key={index} language={language} code={code} />;
        } else {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {part}
            </span>
          );
        }
      })}
    </div>
  );
};

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && <AIAvatar />}
      <div
        className={`max-w-2xl p-4 rounded-lg text-white ${
          isUser ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'
        }`}
      >
        {message.isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        ) : (
          <MessageContent content={message.content} isImage={message.isImage} />
        )}
      </div>
       {isUser && <UserAvatar />}
    </div>
  );
};

export default MessageComponent;
