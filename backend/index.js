const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// Routes
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

const app = express();
const server = http.createServer(app);

// 1. Better CORS Configuration
const corsOptions = {
  origin: ["https://vistafluence.com", "http://localhost:5173"], // Local aur Production dono add karein
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};

app.use(cors(corsOptions));

// 2. Socket.io with explicit CORS
const io = new Server(server, {
  cors: corsOptions, // Wahi options use karein jo upar hain
  transports: ["websocket", "polling"], // Connectivity issues fix karne ke liye
});

connectDB();

// Important: Instamojo Webhook hamesha JSON middleware se pehle hona chahiye
app.post(
  "/api/instamojo/webhook",
  express.raw({ type: "application/json" }),
  instamojoRoutes
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the backend API! Server is Live 🚀");
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

// Socket Logic
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on("register", (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`✅ User ${userId} registered`);
    }
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`👥 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      if (!socket.userId || socket.userId !== data.sender) {
        return console.error("❌ Security alert: Unauthorized sender");
      }

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
      if (receiverSocketId) {
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
      console.log(`⚠️ User ${socket.userId} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));