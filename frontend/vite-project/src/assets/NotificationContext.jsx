import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import socket from "./socket";

export const NotificationContext =
  createContext();

export function NotificationProvider({
  children,
}) {
  const [notifications, setNotifications] =
    useState([]);

  const [unread, setUnread] =
    useState({});

  const addNotification = useCallback(
    (payload) => {
      setNotifications((prev) => {
        const exists = prev.some(
          (n) => n.id === payload.id
        );

        if (exists) return prev;

        return [
          ...prev,
          {
            ...payload,
            id:
              payload.id ||
              Date.now() + Math.random(),
            timestamp: new Date(),
          },
        ];
      });

      if (payload.senderId) {
        setUnread((prev) => ({
          ...prev,
          [payload.senderId]: true,
        }));
      }
    },
    []
  );

  const removeNotification =
    useCallback((id) => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );
    }, []);

  const markAsRead = useCallback(
    (userId) => {
      setUnread((prev) => ({
        ...prev,
        [userId]: false,
      }));
    },
    []
  );

  useEffect(() => {
    const handleInboxPing = (
      payload
    ) => {
      console.log(
        "📨 Notification:",
        payload
      );

      addNotification(payload);
    };

    socket.on(
      "inbox_ping",
      handleInboxPing
    );

    return () => {
      socket.off(
        "inbox_ping",
        handleInboxPing
      );
    };
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unread,
        setUnread,
        addNotification,
        removeNotification,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () =>
  useContext(NotificationContext);