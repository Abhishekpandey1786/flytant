import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "./socket";
import { AuthContext } from "./AuthContext.jsx";

const api = axios.create({
  baseURL: "https://vistafluence.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Chats.jsx से मैचिंग फॉर्मेट
const getRoomId = (id1, id2) => {
  const sorted = [id1, id2].sort().join(":");
  return `camp:general:${sorted}`;
};

export default function ChatList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState({}); 
  const [lastMessages, setLastMessages] = useState({});
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChattableUsers = async () => {
      if (!user?._id) return;
      try {
        const [brandsRes, influencersRes] = await Promise.all([
          api.get("/advertiser/brands"),
          api.get("/users/influencers"),
        ]);
        let combined = [...brandsRes.data, ...influencersRes.data].filter(u => u._id !== user._id);
        setUsers(combined);
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChattableUsers();
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const handleMessage = (msg) => {
      const otherId = msg.sender === user._id ? msg.receiver : msg.sender;
      
      setLastMessages(prev => ({ ...prev, [otherId]: msg.text }));
      if (msg.sender !== user._id) setUnread(prev => ({ ...prev, [otherId]: true }));

      // WHATSAPP SORTING LOGIC
      setUsers((prevUsers) => {
        const updated = [...prevUsers];
        const index = updated.findIndex(u => u._id === otherId);
        if (index !== -1) {
          const [target] = updated.splice(index, 1);
          return [target, ...updated]; // उसे टॉप पर ले आएं
        }
        return updated;
      });
    };

    socket.on("message_received", handleMessage);
    return () => socket.off("message_received", handleMessage);
  }, [user]);

  const handleUserClick = async (otherUser) => {
    if (!user || !otherUser) return;
    const roomId = getRoomId(user._id, otherUser._id);
    try {
      await api.put(`/chats/read-messages/${roomId}`);
      setUnread(prev => ({ ...prev, [otherUser._id]: false }));
      navigate(`/chats?user=${otherUser._id}`);
    } catch {
      navigate(`/chats?user=${otherUser._id}`);
    }
  };

  if (loading) return <div className="h-[300px] flex items-center justify-center text-slate-500 animate-pulse">Loading Chats...</div>;

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800"><h2 className="text-xl font-bold text-white">Conversations</h2></div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {users.map((u) => {
          const isUnread = unread[u._id];
          return (
            <div key={u._id} onClick={() => handleUserClick(u)} className={`flex items-center gap-4 rounded-2xl border p-3 cursor-pointer transition-all ${isUnread ? "bg-slate-800/80 border-fuchsia-500/40" : "bg-slate-900 border-transparent hover:bg-slate-800/60"}`}>
              <div className="relative">
                <img src={u.avatar || u.logo || "https://placehold.co/100"} className={`h-14 w-14 rounded-full object-cover border-2 ${isUnread ? "border-fuchsia-500" : "border-slate-700"}`} />
                {isUnread && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span><span className="relative h-4 w-4 rounded-full bg-fuchsia-600 border-2 border-slate-900"></span></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center"><h3 className={`truncate font-bold ${isUnread ? "text-fuchsia-400" : "text-slate-100"}`}>{u.name || u.businessName}</h3>{isUnread && <span className="text-[10px] bg-fuchsia-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">NEW</span>}</div>
                <p className={`truncate text-sm mt-0.5 ${isUnread ? "text-slate-100 font-semibold" : "text-slate-500"}`}>{lastMessages[u._id] || "Tap to chat"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}