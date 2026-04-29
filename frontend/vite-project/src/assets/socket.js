import { io } from "socket.io-client";

// Pura app isi ek instance ko use karega
const socket = io("https://vistafluence.onrender.com", {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
});

export default socket;