// src/components/Chats.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function getRoomId(campaignId, me, other) {
  const pair = [me, other].sort().join(":");
  return `camp:${campaignId}:${pair}`;
}

export default function Chats() {
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState({});

  const boxRef = useRef(null);

  // Fetch users
  useEffect(() => {
    const fetchChattableUsers = async () => {
      if (!user) return;
      try {
        const [brandsRes, influencersRes] = await Promise.all([
          api.get("/advertiser/brands"),
          api.get("/users/influencers"),
        ]);
        let combined = [...brandsRes.data, ...influencersRes.data];
        combined = combined.filter((u) => u._id !== user._id);
        setUsers(combined);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchChattableUsers();
  }, [user]);

  // Load chat when activeChat changes
  useEffect(() => {
    if (!activeChat || !user?._id) return;

    const roomId = getRoomId("general", user._id, activeChat._id);
    setMessages([]);
    setLoading(true);

    socket.emit("join_room", roomId);

    const onMsg = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("message_received", onMsg);

    (async () => {
      try {
        const { data } = await api.get(`/chats/${roomId}`);
        setMessages(data);
        setUnread((prev) => ({ ...prev, [activeChat._id]: false }));
      } catch (err) {
        console.error("Failed to load chat:", err);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      socket.off("message_received", onMsg);
    };
  }, [activeChat, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTo({
        top: boxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Handle unread + reorder
  useEffect(() => {
    if (!user?._id) return;

    const onNewMsg = (msg) => {
      if (msg.receiver === user._id) {
        setUnread((prev) => ({ ...prev, [msg.sender]: true }));
      }
      setUsers((prev) => {
        const without = prev.filter(
          (u) => u._id !== msg.sender && u._id !== msg.receiver
        );
        const senderUser = prev.find(
          (u) => u._id === msg.sender || u._id === msg.receiver
        );
        if (senderUser) {
          return [senderUser, ...without];
        }
        return prev;
      });
    };

    socket.on("message_received", onNewMsg);

    return () => {
      socket.off("message_received", onNewMsg);
    };
  }, [user]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;

    const roomId = getRoomId("general", user._id, activeChat._id);

    socket.emit("send_message", {
      roomId,
      text,
      sender: user._id,
      receiver: activeChat._id,
      senderName: user.name,
      senderAvatar: user.avatar,
    });

    setText("");
    setUnread((prev) => ({ ...prev, [activeChat._id]: false }));
  };

  return (
    <div className="flex h-screen md:h-[85vh] rounded-2xl bg-slate-900 overflow-hidden neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition">
      <div
        className={`flex flex-col border-r border-slate-800 w-full md:w-1/3 ${
          activeChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-slate-800 text-lg font-bold text-white">
          Chats
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => {
                setActiveChat(u);
                setUnread((prev) => ({ ...prev, [u._id]: false }));
              }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition neno-button shadow-xl border-fuchsia-800 ${
                activeChat?._id === u._id
                  ? "bg-fuchsia-700/30 shadow-fuchsia-800"
                  : unread[u._id]
                  ? "bg-slate-700 border border-fuchsia-400"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              <img
                src={u.avatar || u.logo || "https://placehold.co/40"}
                alt={u.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-600"
              />
              <div className="flex-1">
                <div className="font-semibold text-white flex justify-between items-center">
                  {u.name || u.businessName}
                  {unread[u._id] && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-fuchsia-500"></span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {unread[u._id] ? "New message!" : "Click to chat"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`flex flex-col flex-1 neno-button shadow-xl hover:shadow-fuchsia-800/50 border-fuchsia-800 transition ${
          activeChat ? "flex" : "hidden md:flex"
        }`}
      >
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-800 sticky top-0 z-10">
              <button
                className="md:hidden text-white mr-2"
                onClick={() => setActiveChat(null)}
              >
                <FaArrowLeft />
              </button>
              <img
                src={
                  activeChat.avatar || activeChat.logo || "https://placehold.co/40"
                }
                alt={activeChat.name}
                className="w-9 h-9 rounded-full border border-fuchsia-500"
              />
              <span className="text-white font-semibold">
                {activeChat.name || activeChat.businessName}
              </span>
            </div>

            {/* Messages */}
            <div
              ref={boxRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900"
            >
              {loading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((m) => {
                  const senderId =
                    typeof m.sender === "object" ? m.sender._id : m.sender;
                  const isMe = senderId === user._id;
                  return (
                    <MessageBubble
                      key={m._id || m.createdAt}
                      text={m.text}
                      isMe={isMe}
                      avatar={m.senderAvatar}
                      name={m.senderName}
                      time={new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    />
                  );
                })
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={send}
              className="p-4 border-t border-slate-800 flex gap-2 bg-slate-800 sticky bottom-0"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 bg-slate-900 text-white rounded-lg px-3 py-2 outline-none focus:ring focus:ring-fuchsia-500 neno-button shadow-xl border border-fuchsia-800"
              />
              <button className="px-4 py-2 rounded-lg bg-fuchsia-600 text-white flex items-center gap-2 neno-button shadow-xl border border-fuchsia-800 hover:shadow-fuchsia-800/50 transition">
                <FaPaperPlane /> Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ text, isMe, avatar, name, time }) {
  return (
    <div
      className={`flex items-end gap-2 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {!isMe && (
        <img
          src={avatar || "https://placehold.co/30"}
          alt=""
          className="w-7 h-7 rounded-full border border-slate-600"
        />
      )}
      <div
        className={`max-w-[80%] sm:max-w-[70%] p-3 rounded-2xl shadow-md break-words ${
          isMe
            ? "bg-fuchsia-600 text-white rounded-br-none shadow-fuchsia-800"
            : "bg-slate-700 text-gray-100 rounded-bl-none"
        }`}
      >
        {!isMe && <div className="text-xs font-bold text-fuchsia-300">{name}</div>}
        <div>{text}</div>
        <div className="text-[10px] opacity-70 mt-1 text-right">{time}</div>
      </div>
    </div>
  );
}
