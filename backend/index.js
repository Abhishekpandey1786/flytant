const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// Routes Import
const chatRoutes = require("./routes/chatRoutes");
const Chat = require("./models/Chat");
const User = require("./models/User");
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

const app = express();
const server = http.createServer(app);

// 1. Socket.io Config (Specific origins for Live)
const io = new Server(server, {
  cors: {
    origin: ["https://vistafluence.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

connectDB();

// 2. CORS Config (SIRF EK BAAR LIKHNA HAI)
const corsOptions = {
  origin: ["https://vistafluence.com", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// 3. Webhook (JSON body parser se pehle aana chahiye)
app.use("/api/instamojo/webhook", express.raw({ type: "application/json" }));

// 4. Standard Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Routes Mapping
app.get("/", (req, res) => {
  res.send("Vistafluence Backend API is Running!");
});

app.use("/api/applied", appliedRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users/", userRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/advertiser", advertiserRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/instamojo", instamojoRoutes);

// 6. Socket.io Logic
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`✅ User ${userId} registered`);
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`👥 Joined room: ${roomId}`);
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
      console.error("❌ Socket Error:", error);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) connectedUsers.delete(socket.userId);
    console.log(`⚠️ Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));