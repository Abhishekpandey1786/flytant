import { io } from "socket.io-client";

// src/socket.js
const socket = io("https://vistafluence.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;