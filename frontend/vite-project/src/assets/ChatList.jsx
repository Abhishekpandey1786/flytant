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

const getRoomId = (id1, id2, campaignId) => {
  const sorted = [id1, id2].sort().join(":");
  return `camp:${campaignId}:${sorted}`;
};

const getEntryKey = (u) => `${u._id}-${u.campaignId}`;

export default function ChatList() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user?._id) return;
      try {
        const res = await api.get("/campaigns/my-connections");

        const sorted = [...res.data].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt || a.createdAt);
          const dateB = new Date(b.lastMessageAt || b.createdAt);
          return dateB - dateA;
        });

        setConnections(sorted);

        // 👇 Sabhi connections ke rooms ko turant join kar do
        // taaki list view mein bhi real-time updates milte rahein
        sorted.forEach((conn) => {
          const roomId = getRoomId(user._id, conn._id, conn.campaignId);
          socket.emit("join_room", roomId);
        });
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const handleMessage = (msg) => {
      const otherId = msg.sender === user._id ? msg.receiver : msg.sender;
      const campaignId = msg.campaignId;
      const entryKey = `${otherId}-${campaignId}`;

      setLastMessages((prev) => ({ ...prev, [entryKey]: msg.text }));
      if (msg.sender !== user._id) {
        setUnread((prev) => ({ ...prev, [entryKey]: true }));
      }

      // REAL-TIME REORDERING
      setConnections((prev) => {
        const updated = [...prev];
        const index = updated.findIndex(
          (u) => u._id === otherId && u.campaignId === campaignId
        );
        if (index !== -1) {
          const [target] = updated.splice(index, 1);
          return [target, ...updated];
        }
        return updated;
      });
    };

    socket.on("message_received", handleMessage);
    return () => socket.off("message_received", handleMessage);
  }, [user]);

  const handleUserClick = async (otherUser) => {
    if (!user || !otherUser) return;
    const roomId = getRoomId(user._id, otherUser._id, otherUser.campaignId);
    const entryKey = getEntryKey(otherUser);
    try {
      await api.put(`/chats/read-messages/${roomId}`);
      setUnread((prev) => ({ ...prev, [entryKey]: false }));
      navigate(`/chats/campaign/${otherUser.campaignId}/user/${otherUser._id}`);
    } catch {
      navigate(`/chats/campaign/${otherUser.campaignId}/user/${otherUser._id}`);
    }
  };

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-500 animate-pulse">
        Loading Chats...
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-500 text-center px-4">
        Koi campaign-based conversation nahi mili. Pehle kisi campaign par
        apply karo ya kisi ki application accept karo.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Conversations</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {connections.map((u) => {
          const entryKey = getEntryKey(u);
          const isUnread = unread[entryKey];
          return (
            <div
              key={entryKey}
              onClick={() => handleUserClick(u)}
              className={`flex items-center gap-4 rounded-2xl border p-3 cursor-pointer transition-all ${
                isUnread
                  ? "bg-slate-800/80 border-fuchsia-500/40"
                  : "bg-slate-900 border-transparent hover:bg-slate-800/60"
              }`}
            >
              <div className="relative">
                <img
                  src={u.avatar || u.logo || "https://placehold.co/100"}
                  className={`h-14 w-14 rounded-full object-cover border-2 ${
                    isUnread ? "border-fuchsia-500" : "border-slate-700"
                  }`}
                />
                {isUnread && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                    <span className="relative h-4 w-4 rounded-full bg-fuchsia-600 border-2 border-slate-900"></span>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3
                    className={`truncate font-bold ${
                      isUnread ? "text-fuchsia-400" : "text-slate-100"
                    }`}
                  >
                    {u.name || u.businessName}
                  </h3>
                  {isUnread && (
                    <span className="text-[10px] bg-fuchsia-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-fuchsia-400/80 truncate">
                  {u.campaignName}
                </p>
                <p
                  className={`truncate text-sm mt-0.5 ${
                    isUnread ? "text-slate-100 font-semibold" : "text-slate-500"
                  }`}
                >
                  {lastMessages[entryKey] || "Tap to chat"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}