const http = require('http');
const { Server } = require('socket.io');
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// --- Routes & Models ---
const chatRoutes = require('./routes/chatRoutes');
const Chat = require('./models/Chat'); // Model
const User = require('./models/User'); // Model
const newsRoutes = require("./routes/news");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const campaignRoutes = require("./routes/campaigns");
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const advertiserRoutes = require('./routes/advertiser');
const appliedRoutes = require("./routes/appliedcampaigns");
const contactRoutes = require("./routes/contact");
const cashfreeRoutes = require('./routes/cashfreeRoutes');
const publicRoutes = require('./routes/notifications');

dotenv.config();

// 1. App and Server Initialization
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://vistafluence.netlify.app/",
    methods: ["GET", "POST"]
  }
});

connectDB();

// --- Middleware Configuration ---
app.use(cors());

// 2. 🛡️ CRITICAL FIX: Cashfree Webhook Raw Body Parser
// Webhook सिग्नेचर जाँच के लिए, आपको raw body (Buffer) की आवश्यकता होती है।
// यह middleware *सिर्फ* Cashfree Webhook endpoint पर लागू होता है, और यह सुनिश्चित करता है कि 
// जब req.body कैशफ्री राउटर में पहुँचे, तो वह Buffer के रूप में रहे, न कि JSON ऑब्जेक्ट के रूप में।
app.use("/api/cashfree/webhook", express.raw({ type: '*/*' })); 


// 3. Normal Body Parsers (10mb limit)
// यह बाकी सभी API रूट्स (/create-order, /api/auth, आदि) के लिए JSON और URL-encoded data को पार्स करेगा।
// **यह सुनिश्चित करता है कि यह raw parser के बाद ही आए ताकि webhook सही से काम करे।**
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// --- API Routes ---
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
app.use('/api/cashfree', cashfreeRoutes); // Cashfree router (इसमें /webhook भी शामिल है)


// --- Socket.io Logic ---
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

// --- Server Listener ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));