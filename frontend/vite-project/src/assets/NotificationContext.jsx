import React, { createContext, useState, useContext, useEffect } from "react";
import { io } from "socket.io-client";

export const NotificationContext = createContext();

const socket = io("https://vistafluence.onrender.com", { transports: ["websocket"] });

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState({});

  const addNotification = (payload) => {
    setNotifications(prev => [
      ...prev,
      {
        ...payload,
        id: Date.now() + Math.random(),
        timestamp: new Date()
      }
    ]);
  };

  // 🔥🔥 GLOBAL SOCKET LISTENER
  useEffect(() => {
    socket.on("message_received", (msg) => {
      // Save notification for system
      addNotification({
        type: "chat",
        text: msg.text,
        sender: msg.sender,
      });

      // Update unread for chat list
      setUnread(prev => ({
        ...prev,
        [msg.sender]: true
      }));
    });

    return () => socket.off("message_received");
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = { notifications, unread, setUnread, addNotification, removeNotification };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
