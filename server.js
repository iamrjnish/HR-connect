const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ room, username }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;
  });

  socket.on("chatMessage", ({ room, message, username }) => {
    io.to(room).emit("chatMessage", { username, message });
  });

  socket.on("disconnect", () => {
    if (socket.room && socket.username) {
      io.to(socket.room).emit("chatMessage", {
        username: "System",
        message: `${socket.username} left the chat.`,
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
