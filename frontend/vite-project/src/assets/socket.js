import { io } from "socket.io-client";

const socket = io("https://vistafluence.onrender.com", {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
});

export default socket;