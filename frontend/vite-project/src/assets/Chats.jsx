import React, { useEffect, useRef, useState, useContext, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";
import { FaPaperPlane, FaArrowLeft, FaCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // एनिमेशन के लिए

const socket = io("https://vistafluence.onrender.com", { 
  transports: ["websocket"],
  reconnectionAttempts: 5 
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

  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState({});

  const boxRef = useRef(null);

  // Socket Registration
  useEffect(() => {
    if (!user?._id) return;
    const registerUser = () => {
      if (socket.connected) socket.emit("register", user._id);
    };
    registerUser();
    socket.on("connect", registerUser);
    return () => socket.off("connect", registerUser);
  }, [user]);

  // Fetch Chattable Users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const [brands, influencers] = await Promise.all([
          api.get("/advertiser/brands"),
          api.get("/users/influencers"),
        ]);
        const combined = [...brands.data, ...influencers.data]
          .filter((u) => u._id !== user._id);
        setUsers(combined);
      } catch (err) {
        console.error("User fetch failed", err);
      }
    };
    fetchUsers();
  }, [user]);

  // Active Chat Logic
  useEffect(() => {
    if (!activeChat || !user?._id) return;

    const roomId = getRoomId("general", user._id, activeChat._id);
    setMessages([]);
    setLoading(true);
    socket.emit("join_room", roomId);

    const handleNewMsg = (msg) => {
        if(msg.roomId === roomId) {
            setMessages((prev) => [...prev, msg]);
        }
    };
    
    socket.on("message_received", handleNewMsg);

    api.get(`/chats/${roomId}`)
      .then(({ data }) => {
        setMessages(data);
        setUnread((prev) => ({ ...prev, [activeChat._id]: false }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    return () => socket.off("message_received", handleNewMsg);
  }, [activeChat, user]);

  // Auto Scroll
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Reorder & Unread Logic
  useEffect(() => {
    if (!user?._id) return;
    const updateList = (msg) => {
      if (msg.receiver === user._id && (!activeChat || activeChat._id !== msg.sender)) {
        setUnread((prev) => ({ ...prev, [msg.sender]: true }));
      }
      // Reorder logic
      setUsers((prev) => {
        const otherId = msg.sender === user._id ? msg.receiver : msg.sender;
        const target = prev.find(u => u._id === otherId);
        if (!target) return prev;
        return [target, ...prev.filter(u => u._id !== otherId)];
      });
    };
    socket.on("message_received", updateList);
    return () => socket.off("message_received", updateList);
  }, [user, activeChat]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || !socket.connected) return;

    const roomId = getRoomId("general", user._id, activeChat._id);
    const msgPayload = {
      roomId,
      text: text.trim(),
      sender: user._id,
      receiver: activeChat._id,
      senderName: user.name,
      senderAvatar: user.avatar,
      createdAt: new Date().toISOString() // Professional touch: local timestamp
    };

    socket.emit("send_message", msgPayload);
    // Optimistic Update (तुरंत मैसेज दिखाना)
    setMessages(prev => [...prev, msgPayload]);
    setText("");
  };

  return (
    <div className="flex h-[85vh] rounded-3xl bg-[#0f172a] overflow-hidden border border-slate-800 shadow-2xl backdrop-blur-md">
      {/* Sidebar */}
      <div className={`flex flex-col border-r border-slate-800 w-full md:w-1/3 lg:w-1/4 ${activeChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-6 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white">Inbox</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => setActiveChat(u)}
              className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                activeChat?._id === u._id ? "bg-fuchsia-600/20 border-r-4 border-fuchsia-500" : "hover:bg-slate-800/50"
              }`}
            >
              <div className="relative">
                <img src={u.avatar || u.logo || "https://placehold.co/40"} className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                {unread[u._id] && <span className="absolute top-0 right-0 w-3 h-3 bg-fuchsia-500 rounded-full border-2 border-slate-900 animate-pulse"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{u.name || u.businessName}</h4>
                <p className="text-xs text-slate-500 truncate">{unread[u._id] ? "New Message..." : "Click to view"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-slate-900/20 ${activeChat ? "flex" : "hidden md:flex"}`}>
        {activeChat ? (
          <>
            <header className="p-4 border-b border-slate-800 flex items-center gap-4 bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
              <button onClick={() => setActiveChat(null)} className="md:hidden text-slate-400 hover:text-white"><FaArrowLeft /></button>
              <img src={activeChat.avatar || activeChat.logo || "https://placehold.co/40"} className="w-10 h-10 rounded-full border border-fuchsia-500/30" />
              <div>
                <h3 className="text-white font-semibold">{activeChat.name || activeChat.businessName}</h3>
                <span className="text-[10px] text-green-500 flex items-center gap-1"><FaCircle size={6} /> Online</span>
              </div>
            </header>

            <div ref={boxRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <AnimatePresence>
                {messages.map((m, idx) => {
                  const isMe = (m.sender?._id || m.sender) === user._id;
                  return (
                    <motion.div
                      key={m._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-lg ${
                        isMe ? "bg-fuchsia-600 text-white rounded-br-none" : "bg-slate-800 text-slate-200 rounded-bl-none"
                      }`}>
                        {m.text}
                        <div className="text-[9px] mt-1 opacity-60 text-right uppercase">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <form onSubmit={send} className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md">
              <div className="flex gap-2 items-center bg-slate-950 rounded-2xl px-4 py-2 border border-slate-700 focus-within:border-fuchsia-500 transition-all">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-white outline-none py-2"
                />
                <button type="submit" className="p-3 bg-fuchsia-600 rounded-xl text-white hover:scale-105 active:scale-95 transition-all">
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center animate-bounce">
                <FaPaperPlane size={30} className="text-fuchsia-500/50" />
            </div>
            <p className="font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}