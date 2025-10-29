import React, { useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { useNotifications } from "./NotificationContext.jsx";
import { io } from "socket.io-client";

const socket = io("https://vistafluence.onrender.com/", { transports: ["websocket"] });

export default function NotificationManager() {
  const { user } = useContext(AuthContext);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user?._id) return;
    socket.emit("register", user._id);
    const onPing = (payload) => {
      addNotification(payload);
    };

    socket.on("inbox_ping", onPing);
    return () => socket.off("inbox_ping", onPing);
  }, [user, addNotification]);

  return null; 
}
