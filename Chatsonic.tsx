

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, startChat } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { UserIcon, SparklesIcon } from './icons/Icons';
import { Spinner } from './common/Spinner';

export const Chatsonic: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startChat();
    setMessages([]);
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseContent = await sendMessage(input);
      const modelMessage: ChatMessage = { role: 'model', content: responseContent };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = { role: 'model', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-slate-800/50 border border-slate-700 rounded-lg">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">Weaver AI Chat</h1>
        <p className="text-sm text-slate-400">Your stateful, multi-turn AI chat assistant.</p>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
              )}
              <div className={`px-4 py-2 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
               {msg.role === 'user' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <div className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200">
                    <Spinner />
                </div>
              </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white focus:ring-teal-500 focus:border-teal-500 transition"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="px-4 py-2.5 bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold rounded-md hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};