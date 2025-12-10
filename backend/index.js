const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// --- Models ---
const Chat = require("./models/Chat"); 
const User = require("./models/User"); 

// --- Routes ---
const chatRoutes = require("./routes/chatRoutes");
const newsRoutes = require("./routes/news");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // Handles /api/users logic
const campaignRoutes = require("./routes/campaigns");
const adminRoutes = require("./routes/admin");
const advertiserRoutes = require("./routes/advertiser");
const appliedRoutes = require("./routes/appliedcampaigns");
const contactRoutes = require("./routes/contact");
const cashfreeRoutes = require("./routes/cashfreeRoutes");
const publicRoutes = require("./routes/notifications");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    // 💡 BEST PRACTICE: Security के लिए, "*" के बजाय अपने फ्रंटएंड URL का उपयोग करें।
    // origin: process.env.CLIENT_URL || "*", 
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

// --- Database Connection ---
connectDB();
app.use(cors());


// --- Body Parsing Middleware ---

// 1. CASHFREE WEBHOOK MIDDLEWARE
// Webhook Signature verification के लिए RAW buffer body आवश्यक है।
// यह लाइन सुनिश्चित करती है कि केवल इस endpoint पर req.body कच्चा (raw) रहे।
app.use("/api/cashfree/webhook", express.raw({ type: "application/json" }));

// 2. STANDARD JSON MIDDLEWARE
// यह बाकी सभी routes के लिए JSON body को parse करता है।
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// --- Express Routes ---

app.get("/", (req, res) => {
  res.send("Welcome to the backend API!");
});

// Note: I merged /api/users/ and /api/users to use only one set of handlers (userRoutes).
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/campaigns", campaignRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/advertiser", advertiserRoutes);
app.use("/api/applied", appliedRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes); // Public/Notifications routes
app.use("/api/contact", contactRoutes);
app.use("/api/cashfree", cashfreeRoutes);


// --- Socket.IO Logic ---
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on("register", (userId) => {
    // Convert userId to string for Map key consistency
    const key = userId.toString(); 
    connectedUsers.set(key, socket.id);
    socket.userId = key;
    console.log(`✅ User ${key} registered with socket ${socket.id}`);
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`👥 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const senderId = data.sender.toString(); // Ensure sender is string
      
      if (!socket.userId || socket.userId !== senderId) {
        console.error(
          `❌ Security alert: Sender ID mismatch or unregistered user. Expected: ${socket.userId}, Received: ${senderId}`
        );
        return;
      }

      const message = new Chat({
        roomId: data.roomId,
        text: data.text,
        sender: senderId,
        receiver: data.receiver,
        senderName: data.senderName,
      });
      await message.save();

      io.to(data.roomId).emit("message_received", message);

      const receiverSocketId = connectedUsers.get(data.receiver.toString());
      if (receiverSocketId && receiverSocketId !== socket.id) {
        io.to(receiverSocketId).emit("inbox_ping", {
          id: Date.now(),
          text: data.text,
          from: data.senderName,
          roomId: data.roomId,
        });
        console.log(`📨 Inbox ping sent to ${data.receiver}`);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
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


// --- Global Error Handler ---
// ⚠️ यह सभी routes के बाद आना चाहिए।
app.use((err, req, res, next) => {
    console.error("🔥 Global Error Handler Caught:", err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        // Production mode में stack trace छिपाएँ
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});
// --- End Global Error Handler ---


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));