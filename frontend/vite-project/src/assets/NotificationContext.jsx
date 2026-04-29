import React, { createContext, useState, useContext, useEffect } from "react";
import socket from "./socket"; // Central socket import

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const onPing = (payload) => {
      setNotifications(prev => [
        ...prev,
        { ...payload, id: Date.now(), timestamp: new Date() }
      ]);
    };

    socket.on("inbox_ping", onPing);
    return () => socket.off("inbox_ping", onPing);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);