const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const chatRoutes = require("./routes/chatRoutes");
const Chat = require("./models/Chat");
const newsRoutes = require("./routes/news");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const campaignRoutes = require("./routes/campaigns");
const adminRoutes = require("./routes/admin");
const usersRoutes = require("./routes/users");
const advertiserRoutes = require("./routes/advertiser");
const appliedRoutes = require("./routes/appliedcampaigns");
const contactRoutes = require("./routes/contact");
const instamojoRoutes = require("./routes/instamojoRoutes");
const publicRoutes = require("./routes/notifications");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Allowed Origins
const allowedOrigins = [
  "https://vistafluence.com",
  "https://www.vistafluence.com",
  "https://vistafluence.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

// ✅ CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// app.options("*", cors());

// ✅ Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Welcome to the backend API!");
});

app.use("/api/applied", appliedRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/advertiser", advertiserRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/instamojo", instamojoRoutes);

// ✅ Socket Logic
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send_message", async (data) => {
    try {
      if (!socket.userId || socket.userId !== data.sender) return;

      const message = new Chat({
        roomId: data.roomId,
        text: data.text,
        sender: data.sender,
        receiver: data.receiver,
        senderName: data.senderName,
      });

      await message.save();
      io.to(data.roomId).emit("message_received", message);

      const receiverSocketId = connectedUsers.get(data.receiver);
      if (receiverSocketId && receiverSocketId !== socket.id) {
        io.to(receiverSocketId).emit("inbox_ping", {
          id: Date.now(),
          text: data.text,
          from: data.senderName,
          roomId: data.roomId,
        });
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);