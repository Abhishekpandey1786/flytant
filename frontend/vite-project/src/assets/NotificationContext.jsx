import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import socket from "./socket";

// =========================
// CONTEXT
// =========================

export const NotificationContext =
  createContext();

// =========================
// PROVIDER
// =========================

export function NotificationProvider({
  children,
}) {
  // =========================
  // STATES
  // =========================

  const [notifications, setNotifications] =
    useState([]);

  const [unread, setUnread] =
    useState({});

  // =========================
  // ADD NOTIFICATION
  // =========================

  const addNotification = useCallback(
    (payload) => {
      setNotifications((prev) => {
        // DUPLICATE PREVENTION

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

            timestamp:
              payload.createdAt ||
              new Date(),
          },
        ];
      });

      // SET UNREAD

      if (payload.senderId) {
        setUnread((prev) => ({
          ...prev,
          [payload.senderId]: true,
        }));
      }
    },
    []
  );

  // =========================
  // REMOVE NOTIFICATION
  // =========================

  const removeNotification =
    useCallback((id) => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );
    }, []);

  // =========================
  // CLEAR ALL
  // =========================

  const clearNotifications =
    useCallback(() => {
      setNotifications([]);
    }, []);

  // =========================
  // MARK AS READ
  // =========================

  const markAsRead = useCallback(
    (userId) => {
      setUnread((prev) => ({
        ...prev,
        [userId]: false,
      }));
    },
    []
  );

  // =========================
  // SOCKET LISTENER
  // =========================

  useEffect(() => {
    const handleInboxPing = (
      payload
    ) => {
      console.log(
        "📨 Notification Received:",
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

  // =========================
  // CONTEXT VALUE
  // =========================

  const value = {
    notifications,

    unread,

    setUnread,

    addNotification,

    removeNotification,

    clearNotifications,

    markAsRead,
  };

  // =========================
  // PROVIDER
  // =========================

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// =========================
// CUSTOM HOOK
// =========================

export const useNotifications = () =>
  useContext(NotificationContext);