import React, { useEffect, useRef, useState, useContext } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";

// Socket.IO Connection (Component ke bahar)
const socket = io("https://vistafluence.onrender.com", { transports: ["websocket"] });

const api = axios.create({ baseURL: "https://vistafluence.onrender.com/api" });
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

  // 1. Socket Registration
  useEffect(() => {
    if (!user?._id) return;
    const reg = () => socket.emit("register", user._id);
    if (socket.connected) reg();
    socket.on("connect", reg);
    return () => socket.off("connect", reg);
  }, [user]);

  // 2. Fetch Users List
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const [b, i] = await Promise.all([
          api.get("/advertiser/brands"),
          api.get("/users/influencers"),
        ]);
        const list = [...b.data, ...i.data].filter(u => u._id !== user._id);
        setUsers(list);
      } catch (err) { console.error("User fetch error", err); }
    };
    fetchUsers();
  }, [user]);

  // 3. Global Listener (Jo messages handle karega chahe chat open ho ya nahi)
  useEffect(() => {
    if (!user?._id) return;

    const handleMsg = (msg) => {
      const currentRoom = activeChat ? getRoomId("general", user._id, activeChat._id) : null;

      // Case A: Agar wahi chat open hai jisne message bheja
      if (msg.roomId === currentRoom) {
        setMessages(prev => [...prev, msg]);
      } 
      // Case B: Agar kisi aur ne message bheja (Unread highlight)
      else if (msg.receiver === user._id) {
        setUnread(prev => ({ ...prev, [msg.sender]: true }));
      }

      // Case C: User List ko reorder karein (Taaki sender top par aa jaye)
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

    const roomId = getRoomId("general", user._id, activeChat._id);
    setLoading(true);
    socket.emit("join_room", roomId);

    api.get(`/chats/${roomId}`)
      .then(res => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    setUnread(prev => ({ ...prev, [activeChat._id]: false }));
  }, [activeChat, user]);

  // Scroll to bottom
  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || !socket.connected) return;

    const roomId = getRoomId("general", user._id, activeChat._id);
    const payload = {
      roomId,
      text: text.trim(),
      sender: user._id,
      receiver: activeChat._id,
      senderName: user.name,
    };

    socket.emit("send_message", payload);
    // Optimistic UI (Backend emit karega toh duplicate handle ho jayega msg._id se)
    // Par cleaner approach ke liye hum message_received ka wait bhi kar sakte hain
    setText("");
  };

  return (
    <div className="flex h-[85vh] rounded-2xl bg-slate-900 border-2 border-fuchsia-800 overflow-hidden shadow-2xl shadow-fuchsia-900/40">
      {/* Sidebar - User List */}
      <div className={`flex flex-col border-r border-slate-800 w-full md:w-1/3 ${activeChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-5 border-b border-slate-800 font-bold text-white text-xl">Inbox</div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => setActiveChat(u)}
              className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                activeChat?._id === u._id ? "bg-fuchsia-700/30 border border-fuchsia-600" : "hover:bg-slate-800"
              } ${unread[u._id] ? "border-l-4 border-l-fuchsia-500 bg-slate-800/50" : ""}`}
            >
              <img src={u.avatar || u.logo || "https://placehold.co/40"} className="w-12 h-12 rounded-full border border-slate-700" />
              <div className="flex-1">
                <div className="font-semibold text-white flex justify-between items-center">
                  {u.name || u.businessName}
                  {unread[u._id] && <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>}
                </div>
                <p className="text-xs text-slate-500 truncate">{unread[u._id] ? "New message received" : "Click to chat"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${activeChat ? "flex" : "hidden md:flex"}`}>
        {activeChat ? (
          <>
            <header className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-800/50 backdrop-blur-md">
              <button onClick={() => setActiveChat(null)} className="md:hidden text-white"><FaArrowLeft /></button>
              <img src={activeChat.avatar || activeChat.logo || "https://placehold.co/40"} className="w-10 h-10 rounded-full border border-fuchsia-500" />
              <span className="text-white font-bold">{activeChat.name || activeChat.businessName}</span>
            </header>

            <div ref={boxRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
              {loading ? (
                <div className="text-center text-slate-500 mt-10 animate-pulse">Syncing messages...</div>
              ) : (
                messages.map((m, i) => {
                  const isMe = (m.sender?._id || m.sender) === user._id;
                  return (
                    <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl shadow-lg ${
                        isMe ? "bg-fuchsia-600 text-white rounded-br-none" : "bg-slate-800 text-slate-200 rounded-bl-none"
                      }`}>
                        <p className="text-sm">{m.text}</p>
                        <p className="text-[10px] mt-1 opacity-50 text-right">{new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={send} className="p-4 bg-slate-900 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-950 text-white rounded-xl px-4 py-3 outline-none border border-slate-700 focus:border-fuchsia-600 transition-all"
              />
              <button type="submit" disabled={!text.trim()} className="bg-fuchsia-600 p-4 rounded-xl text-white hover:bg-fuchsia-500 disabled:opacity-50">
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-lg italic">
            Select a contact to start messaging
          </div>
        )}
      </div>
    </div>
  );
}