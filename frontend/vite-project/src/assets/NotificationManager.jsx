import React, { useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { useNotifications } from "./NotificationContext.jsx";
// 🚨 Purana io import aur connection hata diya hai
import socket from "./socket.js"; 

export default function NotificationManager() {
  const { user } = useContext(AuthContext);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Agar user logged in nahi hai toh kuch mat karo
    if (!user?._id) return;

    // Server par register karo (Shared socket instance use ho raha hai)
    const register = () => socket.emit("register", user._id);
    
    if (socket.connected) register();
    socket.on("connect", register);

    const onPing = (payload) => {
      // Notification sound ya popup trigger karne ke liye
      addNotification(payload);
    };

    socket.on("inbox_ping", onPing);

    // Cleanup: Memory leaks se bachne ke liye
    return () => {
      socket.off("connect", register);
      socket.off("inbox_ping", onPing);
    };
  }, [user, addNotification]);

  return null; 
}