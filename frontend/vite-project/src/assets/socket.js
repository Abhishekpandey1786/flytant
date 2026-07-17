import { io } from "socket.io-client";

const SOCKET_URL = "https://vistafluence.onrender.com";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export default socket;