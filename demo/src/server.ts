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
