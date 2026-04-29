import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import socket from "./socket";
import { AuthContext } from "./AuthContext.jsx";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";

const api = axios.create({
  baseURL: "https://vistafluence.onrender.com/api",
});

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
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get("user");

  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState({});
  
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  // 1. FETCH USERS WITH SORTING
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?._id) return;
      try {
        const [brandsRes, influencersRes] = await Promise.all([
          api.get("/advertiser/brands"),
          api.get("/users/influencers"),
        ]);
        
        // CRITICAL: डेटाबेस के lastMessageAt के हिसाब से सॉर्ट करें ताकि रिफ्रेश के बाद अभिषेक पांडे ऊपर रहे
        const combined = [...brandsRes.data, ...influencersRes.data]
          .filter((u) => u._id !== user._id)
          .sort((a, b) => {
            const dateA = new Date(a.lastMessageAt || a.createdAt);
            const dateB = new Date(b.lastMessageAt || b.createdAt);
            return dateB - dateA;
          });

        setUsers(combined);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, [user]);

  // 2. AUTO SELECT FROM URL
  useEffect(() => {
    if (!selectedUserId || users.length === 0) return;
    const foundUser = users.find((u) => u._id === selectedUserId);
    if (foundUser) setActiveChat(foundUser);
  }, [selectedUserId, users]);

  // 3. REALTIME MESSAGE & SORTING
  useEffect(() => {
    if (!user?._id) return;

    const handleMessage = (msg) => {
      const currentRoomId = activeChat ? getRoomId(user._id, activeChat._id) : null;

      if (msg.roomId === currentRoomId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        if (msg.sender !== user._id) {
          api.put(`/chats/read-messages/${currentRoomId}`).catch(() => {});
        }
      }

      const otherId = msg.sender === user._id ? msg.receiver : msg.sender;
      if (msg.receiver === user._id && (!activeChat || msg.sender !== activeChat._id)) {
        setUnread((prev) => ({ ...prev, [msg.sender]: true }));
      }

      // SIDEBAR LIVE SORTING
      setUsers((prevUsers) => {
        const updated = [...prevUsers];
        const index = updated.findIndex((u) => u._id === otherId);
        if (index !== -1) {
          const [target] = updated.splice(index, 1);
          return [target, ...updated];
        }
        return updated;
      });
    };

    socket.on("message_received", handleMessage);
    return () => socket.off("message_received", handleMessage);
  }, [user, activeChat]);

  // 4. LOAD HISTORY
  useEffect(() => {
    if (!activeChat || !user?._id) return;
    const roomId = getRoomId(user._id, activeChat._id);
    setMessages([]);
    setLoading(true);
    socket.emit("join_room", roomId);
    setUnread((prev) => ({ ...prev, [activeChat._id]: false }));
    api.put(`/chats/read-messages/${roomId}`).catch(() => {});
    inputRef.current?.focus();
    api.get(`/chats/${roomId}`).then((res) => setMessages(res.data)).finally(() => setLoading(false));
  }, [activeChat, user]);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
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
      senderAvatar: user.avatar,
    });
    setText("");
  };

  return (
    <div className="flex h-[85vh] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
      {/* Sidebar */}
      <div className={`flex flex-col border-r border-slate-800 w-full md:w-[340px] ${activeChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-5 border-b border-slate-800 bg-slate-950 text-white text-xl font-bold">Messages</div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-900">
          {users.map((u) => (
            <div key={u._id} onClick={() => setActiveChat(u)} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${activeChat?._id === u._id ? "bg-fuchsia-600/10 border-fuchsia-600/50" : "bg-transparent border-transparent hover:bg-slate-800"}`}>
              <div className="relative">
                <img src={u.avatar || u.logo || "https://placehold.co/50"} alt="" className={`w-12 h-12 rounded-full object-cover border ${activeChat?._id === u._id ? "border-fuchsia-500" : "border-slate-700"}`} />
                {unread[u._id] && (
                  <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-fuchsia-600"></span>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${unread[u._id] ? "text-fuchsia-400" : "text-white"}`}>{u.name || u.businessName}</h3>
                <p className={`text-xs truncate ${unread[u._id] ? "text-slate-200 font-bold" : "text-slate-500"}`}>{unread[u._id] ? "New message received" : "Tap to chat"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-slate-950 ${activeChat ? "flex" : "hidden md:flex"}`}>
        {activeChat ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-900/50"><button onClick={() => setActiveChat(null)} className="md:hidden text-white mr-2"><FaArrowLeft /></button><img src={activeChat.avatar || activeChat.logo || "https://placehold.co/40"} className="w-10 h-10 rounded-full object-cover border border-fuchsia-500" /><h2 className="text-white font-bold">{activeChat.name || activeChat.businessName}</h2></div>
            <div ref={boxRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => {
                const isMe = (m.sender?._id || m.sender) === user._id;
                return (
                  <div key={m._id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-fuchsia-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-100 rounded-tl-none"}`}>
                      <p>{m.text}</p>
                      <div className="text-[10px] opacity-50 text-right mt-1">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={send} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." className="flex-1 bg-slate-950 border border-slate-700 focus:border-fuchsia-500 outline-none rounded-xl px-4 py-3 text-white" />
              <button type="submit" disabled={!text.trim()} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 rounded-xl"><FaPaperPlane /></button>
            </form>
          </>
        ) : <div className="flex-1 flex items-center justify-center text-slate-600 font-medium">Select a contact to start messaging</div>}
      </div>
    </div>
  );
}