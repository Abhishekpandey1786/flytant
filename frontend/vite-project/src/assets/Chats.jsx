import React, { useEffect, useRef, useState, useContext } from "react";
import socket from "./socket.js"; // Central socket import
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";

const api = axios.create({ baseURL: "https://vistafluence.onrender.com/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function getRoomId(me, other) {
  const pair = [me, other].sort().join(":");
  return `camp:general:${pair}`;
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

  // 1. Register User on Socket
  useEffect(() => {
    if (!user?._id) return;
    const register = () => socket.emit("register", user._id);
    if (socket.connected) register();
    socket.on("connect", register);
    return () => socket.off("connect", register);
  }, [user]);

  // 2. Fetch Initial Users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const [b, i] = await Promise.all([
          api.get("/advertiser/brands"),
          api.get("/users/influencers"),
        ]);
        setUsers([...b.data, ...i.data].filter(u => u._id !== user._id));
      } catch (err) { console.error(err); }
    };
    fetchUsers();
  }, [user]);

  // 3. Global Message Listener (Active Chat + Sidebar Reorder)
  useEffect(() => {
    if (!user?._id) return;

    const handleMsg = (msg) => {
      const currentRoom = activeChat ? getRoomId(user._id, activeChat._id) : null;

      if (msg.roomId === currentRoom) {
        setMessages(prev => [...prev, msg]);
      } else if (msg.receiver === user._id) {
        setUnread(prev => ({ ...prev, [msg.sender]: true }));
      }

      // Reorder Users List (WhatsApp Style)
      setUsers(prev => {
        const otherId = msg.sender === user._id ? msg.receiver : msg.sender;
        const target = prev.find(u => u._id === otherId);
        if (!target) return prev;
        return [target, ...prev.filter(u => u._id !== otherId)];
      });
    };

    socket.on("message_received", handleMsg);
    return () => socket.off("message_received", handleMsg);
  }, [user, activeChat]);

  // 4. Load Chat History
  useEffect(() => {
    if (!activeChat || !user?._id) return;
    const roomId = getRoomId(user._id, activeChat._id);
    
    setLoading(true);
    socket.emit("join_room", roomId);
    setUnread(prev => ({ ...prev, [activeChat._id]: false }));

    api.get(`/chats/${roomId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [activeChat, user]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || !socket.connected) return;

    const roomId = getRoomId(user._id, activeChat._id);
    socket.emit("send_message", {
      roomId,
      text: text.trim(),
      sender: user._id,
      receiver: activeChat._id,
      senderName: user.name,
    });
    setText("");
  };

  return (
    <div className="flex h-[85vh] rounded-2xl bg-slate-900 border-2 border-fuchsia-800 overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className={`flex flex-col border-r border-slate-800 w-full md:w-1/3 ${activeChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-5 border-b border-slate-800 font-bold text-white text-xl">Messages</div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => setActiveChat(u)}
              className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                activeChat?._id === u._id ? "bg-fuchsia-700/30 border border-fuchsia-600" : "hover:bg-slate-800"
              }`}
            >
              <div className="relative">
                <img src={u.avatar || u.logo || "https://placehold.co/40"} className="w-12 h-12 rounded-full border border-slate-700" />
                {unread[u._id] && <span className="absolute top-0 right-0 w-3 h-3 bg-fuchsia-500 rounded-full border-2 border-slate-900 animate-pulse"></span>}
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">{u.name || u.businessName}</div>
                <div className="text-xs text-slate-500">{unread[u._id] ? "New message received" : "Tap to chat"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${activeChat ? "flex" : "hidden md:flex"}`}>
        {activeChat ? (
          <>
            <header className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-800/50">
              <button onClick={() => setActiveChat(null)} className="md:hidden text-white"><FaArrowLeft /></button>
              <img src={activeChat.avatar || activeChat.logo || "https://placehold.co/40"} className="w-10 h-10 rounded-full" />
              <span className="text-white font-bold">{activeChat.name || activeChat.businessName}</span>
            </header>

            <div ref={boxRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
              {loading ? (
                <div className="text-center text-slate-600 animate-pulse mt-10">Fetching history...</div>
              ) : messages.map((m, i) => {
                const isMe = (m.sender?._id || m.sender) === user._id;
                return (
                  <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl shadow-lg ${isMe ? "bg-fuchsia-600 text-white rounded-br-none" : "bg-slate-800 text-slate-200 rounded-bl-none"}`}>
                      <p className="text-sm">{m.text}</p>
                      <p className="text-[10px] mt-1 opacity-50 text-right">{new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={send} className="p-4 bg-slate-900 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-950 text-white rounded-xl px-4 py-3 outline-none border border-slate-700 focus:border-fuchsia-600 transition-all"
              />
              <button type="submit" disabled={!text.trim()} className="bg-fuchsia-600 p-4 rounded-xl text-white hover:bg-fuchsia-500 disabled:opacity-50">
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-600 italic text-lg">
            Choose a conversation to start
          </div>
        )}
      </div>
    </div>
  );
}