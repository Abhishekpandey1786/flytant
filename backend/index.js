const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const helmet = require("helmet");
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
const academyRoutes = require("./routes/academyRoutes");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

connectDB();
app.use(cors());
app.use(helmet());
app.post(
  "/api/instamojo/webhook",
  express.raw({ type: "application/json" }),
  instamojoRoutes,
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the backend API!");
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
app.use("/api/academy", academyRoutes);
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on("register", (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`✅ User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("join_room", (roomId) => {
    const rooms = [...socket.rooms];

    if (!rooms.includes(roomId)) {
      socket.join(roomId);

      console.log(`👥 ${socket.id} joined ${roomId}`);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      if (!socket.userId || socket.userId !== data.sender) {
        console.log("❌ Unauthorized sender");
        return;
      }
      if (!data.roomId || !data.text || !data.sender || !data.receiver) {
        console.log("❌ Invalid message payload");
        return;
      }

      const message = new Chat({
        roomId: data.roomId,
        text: data.text,
        sender: data.sender,
        receiver: data.receiver,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
      });
      await message.save();
      await User.updateMany(
      { _id: { $in: [data.sender, data.receiver] } },
      { $set: { lastMessageAt: new Date() } }
    );
      io.to(data.roomId).emit("message_received", message);

      const receiverSocketId = connectedUsers.get(data.receiver);
    if (receiverSocketId && receiverSocketId !== socket.id) {

        const senderUser = await User.findById(data.sender);

       io.to(receiverSocketId).emit("inbox_ping", {
        id: message._id,
        text: data.text,
        from: senderUser?.name || senderUser?.businessName || data.senderName || "New Message",
        senderId: data.sender,
        roomId: data.roomId,
        createdAt: message.createdAt,
      });

        console.log(`📨 Notification sent to ${data.receiver}`);
    }

    console.log(`💬 Message sent: ${data.sender} -> ${data.receiver} (LastMessageAt updated)`);
  } catch (error) {
    console.error("❌ Chat Send Error:", error);
  }
  });

  socket.on("disconnect", () => {
    console.log(`⚠️ Socket disconnected: ${socket.id}`);
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`❌ User ${socket.userId} removed from connected users`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
