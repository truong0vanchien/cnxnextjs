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
npx create-next-app@latest demo --typescript --tailwind

# Di chuyển vào thư mục
cd demo

# Cấu trúc chính:
src/
  app/
    page.tsx          # Đăng nhập
    chat/
      page.tsx        # Trang chat
  server.ts           # Socket
package.json          # Cấu hình
```

## 3. Cấu hình Socket.IO

Cài thêm Socket.IO:

```bash
npm install socket.io socket.io-client tsx
```

Tạo server Socket.IO (`src/server.ts`):

```ts
// server.ts
import { createServer } from "node:http";
import next from "next";
import { Server as IOServer } from "socket.io";
import path from "path";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

const port = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handler(req, res);
  });

  const io = new IOServer(httpServer, {
    // tuỳ chọn nếu cần
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);

    socket.on("chat message", (msg: string) => {
      io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Server listening at http://localhost:${port}`);
  });
});

```

## 4. Trang chủ (`src/app/page.tsx`)

```tsx
'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (username.trim() !== "") {
      router.push(`/chat?username=${username}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Đăng nhập Chat</h1>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tên của bạn"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Vào Chat
        </button>
      </div>
    </div>
  );
}

```

## 5. Trang Chat (`src/app/chat/page.tsx`)

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function ChatPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "Người dùng ẩn danh";

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
      socket.emit("chat message", `${username}: ${message}`);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Chat với {username}</h1>

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
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            className="flex-1 border rounded p-2"
            placeholder="Nhập tin nhắn..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 6. Cấu hình (`package.json`)

```json
{
  "name": "me",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "server": "tsx src/server.ts"
  },
  "dependencies": {
    "next": "15.5.3",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "socket.io": "^4.8.1",
    "socket.io-client": "^4.8.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.3",
    "tailwindcss": "^4",
    "tsx": "^4.20.5",
    "typescript": "^5"
  }
}

```

## 7. Cách chạy demo

```bash
npm run server
```

Mở: [http://localhost:3000](http://localhost:3000)

## 8. Chạy với tên miền (nếu có)

```bash
ngrok http 3000 --domain lylah-unlaboring-tenurially.ngrok-free.dev
```

Mở: [https://lylah-unlaboring-tenurially.ngrok-free.dev](https://lylah-unlaboring-tenurially.ngrok-free.dev)

## 9. Nội dung trình bày (20-30 phút)

1. Giới thiệu Next.js 15 & App Router.
2. Cấu trúc `src/app`.
3. Tích hợp Tailwind.
4. Sử dụng `useState`, `useEffect` để quản lý state & lifecycle.
5. Demo chat real-time với Socket.IO.
6. Router trong Next.js (`/chat` route).
7. Q&A và hướng phát triển thêm.
