const http = require('http');
const { Server } = require('socket.io');
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

// ROUTES
const chatRoutes = require('./routes/chatRoutes');
const Chat = require('./models/Chat');
const User = require('./models/User');
const newsRoutes = require("./routes/news");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const campaignRoutes = require("./routes/campaigns");
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const advertiserRoutes = require('./routes/advertiser');
const appliedRoutes = require("./routes/appliedcampaigns");
const contactRoutes = require("./routes/contact");
const cashfreeRoutes = require('./routes/cashfreeRoutes'); // webhook included
const publicRoutes = require('./routes/notifications');

// EXPRESS + SOCKET.IO
const app = express();
const server = http.createServer(app);

connectDB();

/*
|--------------------------------------------------------------------------
|  FIX #1 — Only webhook route must use RAW body
|--------------------------------------------------------------------------
*/
app.post(
  '/api/cashfree/webhook',
  express.raw({ type: '*/*' }),
  cashfreeRoutes
);

/*
|--------------------------------------------------------------------------
| FIX #2 — Other routes use JSON
|--------------------------------------------------------------------------
*/
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Normal cashfree APIs
app.use('/api/cashfree', cashfreeRoutes);

// Other routes
app.get("/", (req, res) => {
  res.send("Welcome to the backend API!");
});

app.use("/api/applied", appliedRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users/", userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/advertiser', advertiserRoutes);
app.use("/api/news", newsRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api", publicRoutes);
app.use("/api/contact", contactRoutes);

/*
|--------------------------------------------------------------------------
|  SOCKET.IO — NO CHANGES NEEDED
|--------------------------------------------------------------------------
*/
const io = new Server(server, {
  cors: {
    origin: "https://vistafluence.netlify.app/",
    methods: ["GET", "POST"]
  }
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`✅ User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`👥 Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const message = new Chat({
        roomId: data.roomId,
        text: data.text,
        sender: data.sender,
        receiver: data.receiver,
        senderName: data.senderName
      });

      await message.save();

      io.to(data.roomId).emit('message_received', message);

      const receiverSocketId = connectedUsers.get(data.receiver);
      if (receiverSocketId && receiverSocketId !== socket.id) {
        io.to(receiverSocketId).emit('inbox_ping', {
          id: Date.now(),
          text: data.text,
          from: data.senderName,
          roomId: data.roomId
        });
        console.log(`📨 Inbox ping sent to ${data.receiver}`);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`⚠️ Socket disconnected: ${socket.id}`);
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`❌ User ${socket.userId} removed from connected users`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
