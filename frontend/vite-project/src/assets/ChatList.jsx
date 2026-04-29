import React, {
  useState,
  useEffect,
  useContext,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "./socket";
import { AuthContext } from "./AuthContext.jsx";
import { FaCircle } from "react-icons/fa";

const api = axios.create({
  baseURL:
    "https://vistafluence.onrender.com/api",
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

export default function ChatList() {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [unread, setUnread] =
    useState({});

  const [lastMessages, setLastMessages] =
    useState({});

  const { user } =
    useContext(AuthContext);

  const navigate =
    useNavigate();

  // =========================
  // FETCH USERS
  // =========================

  useEffect(() => {
    const fetchChattableUsers =
      async () => {
        if (!user?._id) {
          return;
        }

        setLoading(true);

        try {
          const [
            brandsRes,
            influencersRes,
          ] = await Promise.all([
            api.get(
              "/advertiser/brands"
            ),

            api.get(
              "/users/influencers"
            ),
          ]);

          let combined = [
            ...brandsRes.data,
            ...influencersRes.data,
          ];

          combined =
            combined.filter(
              (u) =>
                u._id !== user._id
            );

          setUsers(combined);
        } catch (error) {
          console.error(
            "Failed to fetch users:",
            error.response?.data ||
              error.message
          );
        } finally {
          setLoading(false);
        }
      };

    fetchChattableUsers();
  }, [user]);

  // =========================
  // REALTIME SOCKET LISTENER
  // =========================

  useEffect(() => {
    if (!user?._id) return;

    const handleMessage = (msg) => {
      const otherUserId =
        msg.sender === user._id
          ? msg.receiver
          : msg.sender;

      // =========================
      // LAST MESSAGE
      // =========================

      setLastMessages((prev) => ({
        ...prev,
        [otherUserId]: msg.text,
      }));

      // =========================
      // UNREAD
      // =========================

      if (
        msg.sender !== user._id
      ) {
        setUnread((prev) => ({
          ...prev,
          [otherUserId]: true,
        }));
      }

      // =========================
      // MOVE CHAT TO TOP
      // =========================

      setUsers((prevUsers) => {
        const targetUser =
          prevUsers.find(
            (u) =>
              u._id ===
              otherUserId
          );

        if (!targetUser)
          return prevUsers;

        return [
          targetUser,

          ...prevUsers.filter(
            (u) =>
              u._id !==
              otherUserId
          ),
        ];
      });
    };

    socket.on(
      "message_received",
      handleMessage
    );

    return () => {
      socket.off(
        "message_received",
        handleMessage
      );
    };
  }, [user]);

  // =========================
  // USER CLICK
  // =========================

  const handleUserClick = (
    otherUser
  ) => {
    if (!user || !otherUser)
      return;

    // REMOVE UNREAD

    setUnread((prev) => ({
      ...prev,
      [otherUser._id]: false,
    }));

    navigate(
      `/chats?user=${otherUser._id}`
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        Loading chats...
      </div>
    );
  }

  // =========================
  // EMPTY
  // =========================

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No users available for
        chat.
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
      {/* HEADER */}

      <div className="border-b border-slate-800 bg-slate-950 px-5 py-4">
        <h2 className="text-xl font-bold text-white">
          Conversations
        </h2>
      </div>

      {/* USERS */}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {users.map(
          (otherUser) => (
            <div
              key={otherUser._id}
              onClick={() =>
                handleUserClick(
                  otherUser
                )
              }
              className="flex items-center gap-4 rounded-2xl border border-transparent bg-slate-900 p-3 cursor-pointer transition-all duration-300 hover:bg-slate-800"
            >
              {/* AVATAR */}

              <div className="relative">
                <img
                  src={
                    otherUser.avatar ||
                    otherUser.logo ||
                    "https://placehold.co/50x50"
                  }
                  alt={
                    otherUser.name
                  }
                  className="h-14 w-14 rounded-full object-cover border border-slate-700"
                />

                {unread[
                  otherUser._id
                ] && (
                  <span className="absolute top-0 right-0 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-500 opacity-75"></span>

                    <span className="relative inline-flex h-4 w-4 rounded-full bg-fuchsia-500 border-2 border-slate-900"></span>
                  </span>
                )}
              </div>

              {/* USER INFO */}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-white font-semibold text-base">
                    {otherUser.name ||
                      otherUser.businessName}
                  </h3>

                  {unread[
                    otherUser._id
                  ] && (
                    <FaCircle className="text-fuchsia-500 text-[10px]" />
                  )}
                </div>

                <p
                  className={`truncate text-sm mt-1 ${
                    unread[
                      otherUser._id
                    ]
                      ? "text-fuchsia-400 font-medium"
                      : "text-slate-400"
                  }`}
                >
                  {lastMessages[
                    otherUser._id
                  ] ||
                    "Start chatting"}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}