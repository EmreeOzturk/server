import http from "http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users = {};
const spectators = {};

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    if (Object.keys(users).length < 2) {
      users[socket.id] = data;
      console.log(data)
      socket.emit("user-joined", [socket.id, Object.keys(users).length, data]);
      if (Object.keys(users).length === 2) {
        socket.broadcast.emit("game-ready", [
          Object.keys(users)[0],
          Object.keys(users)[1],
        ]);
        socket.emit("game-ready", [
          Object.keys(users)[0],
          Object.keys(users)[1],
        ]);
      }
    } else {
      spectators[socket.id] = data;
      socket.emit("spectator-joined", socket.id);
      socket.broadcast.emit("spectator-joined", socket.id);
    }

    socket.on("change-turn", (data) => {
      socket.broadcast.emit("change-turn", data);
      socket.emit("change-turn", data);
    });
    socket.on("send-attack", (data) => {
      socket.broadcast.emit("receive-attack", data);
    });
  });
  socket.on("game-finish", (data) => {
    socket.broadcast.emit("game-finish", data);
    socket.emit("game-finish", data);
  });
  socket.on("send-board", (data) => {
    socket.broadcast.emit("receive-board", data);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    delete spectators[socket.id];
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
