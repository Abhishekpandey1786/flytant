// ===============================
// src/components/Chats.jsx
// ===============================

import React, {
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";

import axios from "axios";

import socket from "./socket";

import { AuthContext } from "./AuthContext.jsx";

import {
  FaPaperPlane,
  FaArrowLeft,
} from "react-icons/fa";

import { useSearchParams } from "react-router-dom";

const api = axios.create({
  baseURL: "https://vistafluence.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function getRoomId(me, other) {
  const pair = [me, other]
    .sort()
    .join(":");

  return `camp:general:${pair}`;
}

export default function Chats() {
  const { user } =
    useContext(AuthContext);

  const [searchParams] =
    useSearchParams();

  const selectedUserId =
    searchParams.get("user");

  const [users, setUsers] =
    useState([]);

  const [activeChat, setActiveChat] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [unread, setUnread] =
    useState({});

  const boxRef = useRef(null);

  const inputRef = useRef(null);

  // =========================
  // FETCH USERS
  // =========================

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?._id) return;

      try {
        const [
          brandsRes,
          influencersRes,
        ] = await Promise.all([
          api.get("/advertiser/brands"),
          api.get("/users/influencers"),
        ]);

        const combined = [
          ...brandsRes.data,
          ...influencersRes.data,
        ].filter(
          (u) => u._id !== user._id
        );

        setUsers(combined);
      } catch (error) {
        console.error(
          "Failed to fetch users:",
          error
        );
      }
    };

    fetchUsers();
  }, [user]);

  // =========================
  // AUTO SELECT CHAT
  // =========================

  useEffect(() => {
    if (
      !selectedUserId ||
      users.length === 0
    )
      return;

    const foundUser = users.find(
      (u) => u._id === selectedUserId
    );

    if (foundUser) {
      setActiveChat(foundUser);
    }
  }, [selectedUserId, users]);

  // =========================
  // MESSAGE LISTENER
  // =========================

  useEffect(() => {
    if (!user?._id) return;

    const handleMessage = (msg) => {
      const currentRoom =
        activeChat
          ? getRoomId(
              user._id,
              activeChat._id
            )
          : null;

      // ACTIVE CHAT MESSAGE

      if (
        msg.roomId === currentRoom
      ) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) => m._id === msg._id
          );

          if (exists) return prev;

          return [...prev, msg];
        });
      }

      // UNREAD

      if (
        msg.receiver === user._id &&
        msg.sender !==
          activeChat?._id
      ) {
        setUnread((prev) => ({
          ...prev,
          [msg.sender]: true,
        }));
      }

      // SIDEBAR REORDER

      setUsers((prev) => {
        const otherId =
          msg.sender === user._id
            ? msg.receiver
            : msg.sender;

        const targetUser =
          prev.find(
            (u) =>
              u._id === otherId
          );

        if (!targetUser)
          return prev;

        return [
          targetUser,
          ...prev.filter(
            (u) =>
              u._id !== otherId
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
  }, [user, activeChat]);

  // =========================
  // LOAD CHAT HISTORY
  // =========================

  useEffect(() => {
    if (
      !activeChat ||
      !user?._id
    )
      return;

    const roomId = getRoomId(
      user._id,
      activeChat._id
    );

    setMessages([]);

    setLoading(true);

    socket.emit(
      "join_room",
      roomId
    );

    setUnread((prev) => ({
      ...prev,
      [activeChat._id]: false,
    }));

    inputRef.current?.focus();

    api
      .get(`/chats/${roomId}`)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error(
          "Failed to load chats:",
          err
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeChat, user]);

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {
    boxRef.current?.scrollTo({
      top:
        boxRef.current
          .scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // =========================
  // SEND MESSAGE
  // =========================

  const send = (e) => {
    e.preventDefault();

    if (
      !text.trim() ||
      !activeChat ||
      !socket.connected
    ) {
      return;
    }

    const roomId = getRoomId(
      user._id,
      activeChat._id
    );

    socket.emit(
      "send_message",
      {
        roomId,

        text: text.trim(),

        sender: user._id,

        receiver:
          activeChat._id,

        senderName: user.name,

        senderAvatar:
          user.avatar,
      }
    );

    setText("");
  };

  return (
    <div className="flex h-[85vh] rounded-2xl overflow-hidden bg-slate-900 border border-fuchsia-700 shadow-2xl">
      {/* SIDEBAR */}

      <div
        className={`flex flex-col border-r border-slate-800 w-full md:w-[340px] ${
          activeChat
            ? "hidden md:flex"
            : "flex"
        }`}
      >
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-white text-2xl font-bold">
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() =>
                setActiveChat(u)
              }
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
                activeChat?._id ===
                u._id
                  ? "bg-fuchsia-700/20 border-fuchsia-600"
                  : "bg-slate-900 border-transparent hover:bg-slate-800"
              }`}
            >
              <div className="relative">
                <img
                  src={
                    u.avatar ||
                    u.logo ||
                    "https://placehold.co/50"
                  }
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-slate-700"
                />

                {unread[u._id] && (
                  <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-fuchsia-500 animate-pulse border-2 border-slate-900"></span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">
                  {u.name ||
                    u.businessName}
                </h3>

                <p className="text-xs text-slate-400 truncate">
                  {unread[u._id]
                    ? "New message received"
                    : "Tap to chat"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}

      <div
        className={`flex-1 flex flex-col ${
          activeChat
            ? "flex"
            : "hidden md:flex"
        }`}
      >
        {activeChat ? (
          <>
            {/* HEADER */}

            <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-800/40 backdrop-blur-md">
              <button
                onClick={() =>
                  setActiveChat(null)
                }
                className="md:hidden text-white"
              >
                <FaArrowLeft />
              </button>

              <img
                src={
                  activeChat.avatar ||
                  activeChat.logo ||
                  "https://placehold.co/40"
                }
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-fuchsia-500"
              />

              <div>
                <h2 className="text-white font-bold">
                  {activeChat.name ||
                    activeChat.businessName}
                </h2>
              </div>
            </div>

            {/* MESSAGES */}

            <div
              ref={boxRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950"
            >
              {loading && (
                <div className="text-center text-slate-500 mt-10">
                  Loading
                  messages...
                </div>
              )}

              {!loading &&
                messages.length ===
                  0 && (
                  <div className="text-center text-slate-500 mt-10">
                    No messages yet
                  </div>
                )}

              {!loading &&
                messages.map(
                  (m, i) => {
                    const senderId =
                      m.sender?._id ||
                      m.sender;

                    const isMe =
                      senderId ===
                      user._id;

                    return (
                      <div
                        key={
                          m._id || i
                        }
                        className={`flex ${
                          isMe
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-lg break-words ${
                            isMe
                              ? "bg-fuchsia-600 text-white rounded-br-none"
                              : "bg-slate-800 text-slate-100 rounded-bl-none"
                          }`}
                        >
                          {!isMe && (
                            <div className="text-xs font-bold text-fuchsia-400 mb-1">
                              {
                                m.senderName
                              }
                            </div>
                          )}

                          <p className="text-sm">
                            {m.text}
                          </p>

                          <div className="text-[10px] opacity-60 text-right mt-1">
                            {new Date(
                              m.createdAt
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
            </div>

            {/* INPUT */}

            <form
              onSubmit={send}
              className="p-4 border-t border-slate-800 bg-slate-900 flex gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) =>
                  setText(
                    e.target.value
                  )
                }
                placeholder="Type your message..."
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-fuchsia-600 outline-none rounded-xl px-4 py-3 text-white transition-all"
              />

              <button
                type="submit"
                disabled={
                  !text.trim()
                }
                className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 rounded-xl transition-all flex items-center justify-center"
              >
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-slate-500 text-lg">
            Select a chat to
            start messaging
          </div>
        )}
      </div>
    </div>
  );
}