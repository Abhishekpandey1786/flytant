import { useEffect, useContext, useRef } from "react";
import socket from "../socket";
import { AuthContext } from "./AuthContext.jsx";

export default function SocketProvider() {
  const { user } = useContext(AuthContext);
  const registered = useRef(false);

  useEffect(() => {
    if (!user?._id) {
      if (socket.connected) socket.disconnect();
      registered.current = false;
      return;
    }

    const registerUser = () => {
      socket.emit("register", user._id);
      registered.current = true;
      console.log("✅ Socket Registered:", user._id);
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      registerUser();
    }

    socket.on("connect", registerUser);

    const handleDisconnect = (reason) => {
      registered.current = false;
      console.log("⚠️ Socket disconnected:", reason);
    };
    socket.on("disconnect", handleDisconnect);

    const handleConnectError = (err) => {
      console.log("❌ Socket connect error:", err.message);
    };
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", registerUser);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [user]);

  return null;
}