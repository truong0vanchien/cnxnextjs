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