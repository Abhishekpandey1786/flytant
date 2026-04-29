import { useEffect, useContext, useRef } from "react";
import socket from "./socket";
import { AuthContext } from "./AuthContext";

export default function SocketProvider() {
  const { user } = useContext(AuthContext);

  const registered = useRef(false);

  useEffect(() => {
    if (!user?._id) return;

    const registerUser = () => {
      if (registered.current) return;

      socket.emit("register", user._id);

      registered.current = true;

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
      registered.current = false;
    };
  }, [user]);

  return null;
}