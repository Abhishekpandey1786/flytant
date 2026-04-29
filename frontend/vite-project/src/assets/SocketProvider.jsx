import { useEffect, useContext } from "react";
import socket from "./socket";
import { AuthContext } from "./AuthContext";

export default function SocketProvider() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?._id) return;

    const registerUser = () => {
      socket.emit("register", user._id);

      console.log(
        "✅ Socket Registered:",
        user._id
      );
    };

    if (socket.connected) {
      registerUser();
    }

    socket.on("connect", registerUser);

    return () => {
      socket.off("connect", registerUser);
    };
  }, [user]);

  return null;
}