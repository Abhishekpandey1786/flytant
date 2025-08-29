import React, { useEffect, useRef, useState, useContext } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";

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
  const { campaignId, userId: otherUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const boxRef = useRef(null);
  const roomId = getRoomId(campaignId, user?._id, otherUserId);
  const isChatPage = location.pathname.includes("/chats");
  useEffect(() => {
    if (!campaignId || !otherUserId) return;
    socket.emit("join_room", roomId);

    const onMsg = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("message_received", onMsg);

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/chats/${roomId}`);
        setMessages(data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      socket.off("message_received", onMsg);
    };
  }, [roomId, campaignId, otherUserId, navigate]);
  useEffect(() => {
    if (boxRef.current)
      boxRef.current.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit("send_message", {
      roomId,
      text,
      sender: user._id,
      receiver: otherUserId,
      senderName: user.name,
      senderAvatar: user.avatar,
    });
    setText("");
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-xl mx-auto border rounded-lg shadow bg-white relative">
      <div className="p-3 border-b font-semibold bg-gray-50">Chat</div>
      <div ref={boxRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet.</div>
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
      <form onSubmit={send} className="p-3 border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border rounded px-3 py-2 outline-none focus:ring focus:ring-green-300"
        />
        <button
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
function MessageBubble({ text, isMe, avatar, name, time }) {
  return (
    <div
      className={`flex items-end space-x-2 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {!isMe && (
        <img src={avatar} alt="" className="w-8 h-8 rounded-full" />
      )}
      <div
        className={`max-w-[70%] p-3 rounded-lg shadow ${
          isMe ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        <div className="text-xs font-bold">{name}</div>
        <div>{text}</div>
        <div className="text-xs opacity-70 mt-1 text-right">{time}</div>
      </div>
    </div>
  );
}
