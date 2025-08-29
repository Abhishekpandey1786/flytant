import React, { createContext, useState, useContext } from "react";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const addNotification = (payload) => {
    setNotifications((prev) => [
      ...prev,
      {
        ...payload,
        id: Date.now() + Math.random(), 
        timestamp: new Date(),
      },
    ]);
  };
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const value = { notifications, addNotification, removeNotification };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}


export const useNotifications = () => {
  return useContext(NotificationContext);
};