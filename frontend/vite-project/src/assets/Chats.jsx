import React, { useEffect, useRef, useState, useContext } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import { useNotifications } from "./NotificationContext"; // ⬅ GLOBAL notifier

const socket = io("https://vistafluence.onrender.com", {
  transports: ["websocket"],
});

const api = axios.create({
  baseURL: "https://vistafluence.onrender.com/api",
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
  const { setActiveChat: setGlobalActiveChat } = useNotifications(); // ⬅ new global

  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

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

  // When chat changes → join that room + load messages
  useEffect(() => {
    if (!activeChat || !user?._id) return;

    const roomId = getRoomId("general", user._id, activeChat._id);

    setMessages([]);
    setLoading(true);
    setGlobalActiveChat(activeChat._id); // ⬅ tell provider which chat is open now

    socket.emit("join_room", roomId);

    const onMsg = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("message_received", onMsg);

    // Load history
    (async () => {
      try {
        const { data } = await api.get(`/chats/${roomId}`);
        setMessages(data);
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

  // Auto scroll
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTo({
        top: boxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

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
  };

  return (
    <div className="flex h-135 md:h-[85vh] rounded-2xl bg-slate-900 overflow-hidden neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition">
      
      {/* USER LIST */}
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
                setGlobalActiveChat(u._id); // ⬅ tell provider chat is open
              }}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition bg-slate-800 hover:bg-slate-700 neno-button shadow-xl border-fuchsia-800`}
            >
              <img
                src={u.avatar || u.logo || "https://placehold.co/40"}
                className="w-10 h-10 rounded-full border border-fuchsia-800 object-cover"
              />
              <div className="flex-1 text-white font-semibold">
                {u.name || u.businessName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div
        className={`flex flex-col flex-1 ${
          activeChat ? "flex" : "hidden md:flex"
        }`}
      >
        {activeChat ? (
          <>
            {/* HEADER */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-800">
              <button
                className="md:hidden text-white mr-2"
                onClick={() => {
                  setActiveChat(null);
                  setGlobalActiveChat(null);
                }}
              >
                <FaArrowLeft />
              </button>

              <img
                src={activeChat.avatar || activeChat.logo || "https://placehold.co/40"}
                className="w-9 h-9 rounded-full border border-fuchsia-500"
              />

              <span className="text-white font-semibold">
                {activeChat.name || activeChat.businessName}
              </span>
            </div>

            {/* MESSAGES */}
            <div
              ref={boxRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900"
            >
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : (
                messages.map((m, i) => {
                  const senderId =
                    typeof m.sender === "object" ? m.sender._id : m.sender;
                  const isMe = senderId === user._id;

                  return (
                    <MessageBubble
                      key={i}
                      text={m.text}
                      isMe={isMe}
                      avatar={
                        !isMe
                          ? m.senderAvatar ||
                            activeChat.avatar ||
                            activeChat.logo
                          : null
                      }
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

            {/* INPUT */}
            <form
              onSubmit={send}
              className="p-4 border-t border-slate-800 flex gap-2 bg-slate-800"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 bg-slate-900 text-white rounded-lg px-3 py-2 outline-none border border-fuchsia-800 neno-button shadow-xl"
              />
              <button className="px-4 py-2 rounded-lg bg-fuchsia-600 text-white flex items-center gap-2 border border-fuchsia-800">
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
          className="w-7 h-7 rounded-full border border-fuchsia-800"
        />
      )}

      <div
        className={`max-w-[80%] p-3 rounded-2xl shadow-md ${
          isMe
            ? "bg-fuchsia-600 text-white rounded-br-none"
            : "bg-slate-700 text-gray-100 rounded-bl-none"
        }`}
      >
        {!isMe && (
          <div className="text-xs font-bold text-fuchsia-300">{name}</div>
        )}
        <div>{text}</div>
        <div className="text-[10px] opacity-70 mt-1 text-right">{time}</div>
      </div>
    </div>
  );
}
