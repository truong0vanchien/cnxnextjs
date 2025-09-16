'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import io from 'socket.io-client';
import OpenAI from 'openai';

const socket = io('http://localhost:3000');

const deepseekApiKey = 'sk-750fafa6254c4a82a24182590bf6839f'; // Thay thế bằng khóa API DeepSeek của bạn

const openai = new OpenAI({
  apiKey: deepseekApiKey,
  baseURL: 'https://api.deepseek.com/v1', // DeepSeek API base URL
  dangerouslyAllowBrowser: true, // Chỉ sử dụng trong môi trường phát triển
});

export default function ChatPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'Người dùng ẩn danh';

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.on('chat message', (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const callDeepSeekAPI = async (question: string) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'deepseek-chat', // Hoặc model DeepSeek khác nếu có
        messages: [{ role: 'user', content: question }],
        stream: false,
      });
      return (
        response.choices[0]?.message?.content ||
        'Không có phản hồi từ DeepSeek.'
      );
    } catch (error) {
      console.error('Lỗi khi gọi DeepSeek API:', error);
      return 'Lỗi khi giao tiếp với DeepSeek API.';
    }
  };

  const sendMessage = async () => {
    if (message.trim() === '') return;

    const userMessage = `${username}: ${message}`;
    socket.emit('chat message', userMessage);
    setMessage('');

    if (message.startsWith('Asky: ')) {
      setIsTyping(true);
      const question = message.substring(6).trim();
      const deepseekResponse = await callDeepSeekAPI(question);
      setIsTyping(false);
      const botMessage = `Asky: ${deepseekResponse}`;
      socket.emit('chat message', botMessage);
    }
  };

  return (
    <div className='flex flex-col items-center p-6'>
      <h1 className='text-2xl font-bold mb-4'>Chat với {username}</h1>

      <div className='w-full max-w-md bg-gray-100 p-4 rounded-lg shadow'>
        <div className='h-64 overflow-y-auto border-b mb-4 p-2'>
          {messages.map((msg, i) => (
            <p key={i} className='mb-1'>
              {msg}
            </p>
          ))}
          {isTyping && (
            <p className='mb-1 text-gray-500 italic'>Asky đang đánh máy...</p>
          )}
        </div>

        <div className='flex gap-2'>
          <input
            type='text'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            className='flex-1 border rounded p-2'
            placeholder='Nhập tin nhắn...'
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400'
            disabled={isTyping}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
