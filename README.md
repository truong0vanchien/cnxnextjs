# Next.js 15 Chat App (App Router + TypeScript + Tailwind + Socket.IO)

## Thời lượng: 20–30 phút

---

## 1. Giới thiệu Next.js 15 (5–7 phút)
- **Next.js là gì?**  
  Framework React hỗ trợ full-stack, có sẵn SSR, SSG, API routes, App Router.
- **Điểm mới ở Next.js 15**  
  - Turbopack nhanh hơn Webpack.  
  - App Router dùng server component tốt hơn.  
  - Tích hợp full-stack dễ dàng (client + API).  
- **Vì sao chọn Next.js thay vì React thuần?**  
  SEO tốt hơn, dễ scale, có router và server tích hợp sẵn.

---

## 2. Công cụ đi kèm (3–5 phút)
- **TailwindCSS**: framework CSS tiện lợi, giúp code UI nhanh.  
- **Socket.IO**: hỗ trợ realtime communication.  
- **React Hooks cơ bản**  
  - `useState`: quản lý state.  
  - `useEffect`: lắng nghe side effect (kết nối socket, gọi API).  
- **Router trong Next.js 15 (App Router)**  
  - App Router (`/app`) thay thế Pages Router.  
  - Sử dụng folder structure để định nghĩa route.

---

## 3. Demo ứng dụng Chat (12–15 phút)

### Bước 1 – Tạo project Next.js 15 + TypeScript + Tailwind
```bash
npx create-next-app@latest my-chat-app --ts
cd my-chat-app
```

Chọn:
- App Router (default)  
- TypeScript: Yes  
- TailwindCSS: Yes  

### Bước 2 – Cài thêm Socket.IO
```bash
npm install socket.io socket.io-client
```

### Bước 3 – Cấu trúc dự án
```
my-chat-app/
├── app/
│   ├── page.tsx         # Chat UI
│   └── api/
│       └── socket/
│           └── route.ts # Socket server
├── components/          # (có thể tách UI component riêng)
├── styles/
│   └── globals.css
├── tailwind.config.ts
└── tsconfig.json
```

### Bước 4 – Tạo Socket.IO server (route handler)
`/app/api/socket/route.ts`
```ts
import { NextRequest } from "next/server";
import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req: NextRequest) {
  // @ts-ignore
  if (!global.io) {
    // @ts-ignore
    global.io = new Server((res?.socket?.server as any)?.io, {
      path: "/api/socketio",
    });

    // @ts-ignore
    global.io.on("connection", (socket: any) => {
      console.log("User connected");

      socket.on("send-message", (msg: string) => {
        // @ts-ignore
        global.io.emit("receive-message", msg);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  }
  return new Response("Socket.IO server running");
}
```

### Bước 5 – UI Chat (Client)
`/app/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>([]);

  useEffect(() => {
    socket = io({ path: "/api/socketio" });

    socket.on("receive-message", (msg: string) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send-message", message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-4 text-center">Next.js 15 Chat</h1>

        <div className="flex-1 overflow-y-auto border rounded p-2 mb-2 h-64">
          {chat.map((c, i) => (
            <div key={i} className="p-1 text-sm">{c}</div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Type message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Chạy thử
```bash
npm run dev
```
Mở trình duyệt tại: [http://localhost:3000](http://localhost:3000)

---

## 5. Kết luận (3 phút)
- **Điểm mạnh Next.js 15**: kết hợp front-end & back-end trong cùng project.  
- **Tailwind**: code UI nhanh, gọn.  
- **Socket.IO**: giúp realtime chat dễ dàng.  
- **React Hooks** (`useState`, `useEffect`): nền tảng quản lý state và side effect.  

👉 Sau buổi demo, có thể mở rộng thành:
- Chat nhiều phòng.  
- Lưu tin nhắn vào DB.  
- Triển khai trên Vercel/Render.
