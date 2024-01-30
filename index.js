import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";

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

io.on("connection", (socket) => {   
  console.log("connected" + socket.id);
  socket.on("new-user", (name) => {
    if (Object.values(users).length > 2) {
      socket.emit("user-limit", "User limit exceeded");
      console.log("User limit exceeded");
      return;
    }
    users[socket.id] = name;
    socket.broadcast.emit("user-connected", name);
    console.log(users);
  });

  socket.on("receive-table-data", (data) => {
    console.log("receive-table-data", data);
    socket.broadcast.emit("send-table-data", data)
  });

  socket.on("disconnect", () => {
    socket.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
