# Next.js 15 Chat Demo

Demo ứng dụng Chat sử dụng **Next.js 15 (App Router, TypeScript, TailwindCSS, Socket.IO)** với cấu trúc thư mục `src/app`.

## 1. Giới thiệu Next.js 15
- Framework React hiện đại do Vercel phát triển.
- Hỗ trợ App Router (dùng `src/app`).
- Tích hợp TypeScript, TailwindCSS.
- Tối ưu hoá SEO, server actions, streaming, edge runtime.

## 2. Khởi tạo dự án

```bash
# Tạo project mới
npx create-next-app@latest chat-demo --typescript --tailwind --use-npm

# Di chuyển vào thư mục
cd chat-demo

# Cấu trúc chính:
src/
  app/
    page.tsx          # Trang chủ
    chat/
      page.tsx        # Trang chat
```

## 3. Cấu hình Socket.IO

Cài thêm Socket.IO:

```bash
npm install socket.io socket.io-client
```

Tạo server Socket.IO (`src/server/socket.ts`):

```ts
import { Server } from "socket.io";

export function initSocket(server: any) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);

    socket.on("chat message", (msg) => {
      io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  return io;
}
```

## 4. Trang Chat (`src/app/chat/page.tsx`)

```tsx
"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io();

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on("chat message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("chat message", message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Chat Demo</h1>

      <div className="w-full max-w-md bg-gray-100 p-4 rounded-lg shadow">
        <div className="h-64 overflow-y-auto border-b mb-4 p-2">
          {messages.map((msg, i) => (
            <p key={i} className="mb-1">
              {msg}
            </p>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border rounded p-2"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 5. Cách chạy demo

```bash
npm run dev
```

Mở: [http://localhost:3000/chat](http://localhost:3000/chat)

## 6. Nội dung trình bày (20-30 phút)

1. Giới thiệu Next.js 15 & App Router.
2. Cấu trúc `src/app`.
3. Tích hợp Tailwind.
4. Sử dụng `useState`, `useEffect` để quản lý state & lifecycle.
5. Demo chat real-time với Socket.IO.
6. Router trong Next.js (`/chat` route).
7. Q&A và hướng phát triển thêm.
