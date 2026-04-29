import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "./socket";
import { AuthContext } from "./AuthContext.jsx";
import { FaCircle } from "react-icons/fa";

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

export default function ChatList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState({}); 
  const [lastMessages, setLastMessages] = useState({});
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getRoomId = (id1, id2) => {
    const sorted = [id1, id2].sort();
    return `chat:${sorted[0]}:${sorted[1]}`;
  };

  useEffect(() => {
    const fetchChattableUsers = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const [brandsRes, influencersRes] = await Promise.all([
          api.get("/advertiser/brands"),
          api.get("/users/influencers"),
        ]);

        let combined = [...brandsRes.data, ...influencersRes.data].filter(
          (u) => u._id !== user._id
        );

        setUsers(combined);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChattableUsers();
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const handleMessage = (msg) => {
      const otherUserId = msg.sender === user._id ? msg.receiver : msg.sender;
      setLastMessages((prev) => ({
        ...prev,
        [otherUserId]: msg.text,
      }));

      if (msg.sender !== user._id) {
        setUnread((prev) => ({
          ...prev,
          [otherUserId]: true,
        }));
      }

      setUsers((prevUsers) => {
        const targetUser = prevUsers.find((u) => u._id === otherUserId);
        if (!targetUser) return prevUsers;

        const otherUsers = prevUsers.filter((u) => u._id !== otherUserId);
        return [targetUser, ...otherUsers]; 
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

      
      setUnread((prev) => ({
        ...prev,
        [otherUser._id]: false,
      }));

      
      navigate(`/chats?user=${otherUser._id}`);
    } catch (error) {
      console.error("Status update failed:", error);
      navigate(`/chats?user=${otherUser._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500 animate-pulse">
        Loading Vistafluence Chats...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
      {/* HEADER */}
      <div className="border-b border-slate-800 bg-slate-950 px-5 py-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Conversations</h2>
      </div>

     
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {users.map((otherUser) => {
          const isUnread = unread[otherUser._id];
          
          return (
            <div
              key={otherUser._id}
              onClick={() => handleUserClick(otherUser)}
              className={`flex items-center gap-4 rounded-2xl border p-3 cursor-pointer transition-all duration-500 
                ${isUnread 
                  ? "bg-slate-800/80 border-fuchsia-500/40 shadow-lg shadow-fuchsia-900/10" 
                  : "bg-slate-900 border-transparent hover:bg-slate-800/60 hover:border-slate-700"}`}
            >
           
              <div className="relative">
                <img
                  src={otherUser.avatar || otherUser.logo || "https://placehold.co/100x100"}
                  alt="profile"
                  className={`h-14 w-14 rounded-full object-cover border-2 transition-transform duration-300
                    ${isUnread ? "border-fuchsia-500 scale-105" : "border-slate-700"}`}
                />

             
                {isUnread && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75"></span>
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-fuchsia-600 border-2 border-slate-900"></span>
                  </span>
                )}
              </div>

           
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`truncate font-bold text-base transition-colors ${isUnread ? "text-fuchsia-400" : "text-slate-100"}`}>
                    {otherUser.name || otherUser.businessName}
                  </h3>
                  {isUnread && (
                    <span className="text-[10px] bg-fuchsia-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">
                      New
                    </span>
                  )}
                </div>

                <p className={`truncate text-sm mt-0.5 transition-all ${isUnread ? "text-slate-100 font-semibold" : "text-slate-500"}`}>
                  {lastMessages[otherUser._id] || "No recent messages"}
                </p>
              </div>

              
              <div className={`text-slate-700 ${isUnread ? "text-fuchsia-500" : ""}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}