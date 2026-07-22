import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import socket from "./socket";
import { AuthContext } from "./AuthContext.jsx";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: "https://vistafluence.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const getRoomId = (me, other, campaignId) => {
  const pair = [me, other].sort().join(":");
  return `camp:${campaignId}:${pair}`;
};

const getEntryKey = (u) => `${u._id}-${u.campaignId}`;

export default function Chats() {
  const { user } = useContext(AuthContext);
  const { campaignId: urlCampaignId, userId: urlUserId } = useParams();
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState({});
  const [lastMessages, setLastMessages] = useState({});

  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const activeChatRef = useRef(null);
  const connectionsRef = useRef([]);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  // 1. FETCH CAMPAIGN-BASED CONNECTIONS + JOIN ALL ROOMS
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

        const initUnread = {};
        const initLast = {};
        sorted.forEach((conn) => {
          const key = getEntryKey(conn);
          if (conn.unreadCount > 0) initUnread[key] = true;
          if (conn.lastMessage) initLast[key] = conn.lastMessage;

          const roomId = getRoomId(user._id, conn._id, conn.campaignId);
          socket.emit("join_room", roomId);
        });
        setUnread(initUnread);
        setLastMessages(initLast);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      }
    };
    fetchConnections();
  }, [user]);

  // 2. AUTO SELECT FROM URL PARAMS
  useEffect(() => {
    if (!urlCampaignId || !urlUserId || connections.length === 0) return;
    const found = connections.find(
      (u) => u._id === urlUserId && u.campaignId === urlCampaignId
    );
    if (found) setActiveChat(found);
  }, [urlCampaignId, urlUserId, connections]);

  // 3. RECONNECT HONE PAR SABHI ROOMS DOBARA JOIN KARO
  useEffect(() => {
    if (!user?._id) return;

    const rejoinAllRooms = () => {
      connectionsRef.current.forEach((conn) => {
        const roomId = getRoomId(user._id, conn._id, conn.campaignId);
        socket.emit("join_room", roomId);
      });
      const currentActive = activeChatRef.current;
      if (currentActive) {
        const roomId = getRoomId(user._id, currentActive._id, currentActive.campaignId);
        socket.emit("join_room", roomId);
      }
      console.log("🔄 Rejoined all rooms after reconnect");
    };

    socket.on("connect", rejoinAllRooms);
    return () => socket.off("connect", rejoinAllRooms);
  }, [user]);

  // 4. REALTIME MESSAGE, UNREAD BUBBLE, LIVE SORTING
  useEffect(() => {
    if (!user?._id) return;

    const handleMessage = (msg) => {
      const currentActive = activeChatRef.current;
      const currentRoomId = currentActive
        ? getRoomId(user._id, currentActive._id, currentActive.campaignId)
        : null;

      const otherId = msg.sender === user._id ? msg.receiver : msg.sender;
      const campaignId = msg.campaignId;
      const entryKey = `${otherId}-${campaignId}`;

    
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;

        if (msg.tempId && prev.some((m) => m._id === msg.tempId)) {
          return prev.map((m) => (m._id === msg.tempId ? msg : m));
        }

        if (msg.roomId === currentRoomId) {
          return [...prev, msg];
        }

        return prev;
      });

      if (msg.sender !== user._id) {
        if (msg.roomId === currentRoomId) {
          api.put(`/chats/read-messages/${currentRoomId}`).catch(() => {});
          socket.emit("messages_seen", { roomId: currentRoomId, seenBy: user._id });
        } else {
          setUnread((prev) => ({ ...prev, [entryKey]: true }));
        }
      }

      setLastMessages((prev) => ({ ...prev, [entryKey]: msg.text }));

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

    const handleSeenAck = ({ roomId, seenBy }) => {
      const currentActive = activeChatRef.current;
      if (!currentActive) return;
      const currentRoomId = getRoomId(user._id, currentActive._id, currentActive.campaignId);
      if (roomId !== currentRoomId) return;
      if (seenBy === user._id) return;

      setMessages((prev) =>
        prev.map((m) =>
          (m.sender?._id || m.sender) === user._id ? { ...m, isRead: true } : m
        )
      );
    };

    socket.on("message_received", handleMessage);
    socket.on("messages_seen_ack", handleSeenAck);
    return () => {
      socket.off("message_received", handleMessage);
      socket.off("messages_seen_ack", handleSeenAck);
    };
  }, [user]);

  // 5. LOAD HISTORY
  useEffect(() => {
    if (!activeChat || !user?._id) return;
    const roomId = getRoomId(user._id, activeChat._id, activeChat.campaignId);
    const entryKey = getEntryKey(activeChat);

    setMessages([]);
    setLoading(true);
    socket.emit("join_room", roomId);
    setUnread((prev) => ({ ...prev, [entryKey]: false }));
    api.put(`/chats/read-messages/${roomId}`).catch(() => {});
    socket.emit("messages_seen", { roomId, seenBy: user._id });
    inputRef.current?.focus();

    api
      .get(`/chats/${roomId}`)
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false));
  }, [activeChat, user]);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  const handleSelectChat = (conn) => {
    setActiveChat(conn);
  };

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;

    if (!socket.connected) {
      alert("Connection lost hai, dobara connect ho raha hai... thodi der me try karo.");
      return;
    }

    const roomId = getRoomId(user._id, activeChat._id, activeChat.campaignId);
    const tempId = `temp-${Date.now()}`;
    const trimmedText = text.trim();

    const optimisticMsg = {
      _id: tempId,
      roomId,
      campaignId: activeChat.campaignId,
      text: trimmedText,
      sender: user._id,
      receiver: activeChat._id,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");

    socket.emit("send_message", {
      roomId,
      campaignId: activeChat.campaignId,
      text: trimmedText,
      sender: user._id,
      receiver: activeChat._id,
      senderName: user.name,
      senderAvatar: user.avatar,
      tempId,
    });
  };

  return (
    <div className="flex h-[85vh] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
      {/* Sidebar */}
      <div
        className={`flex flex-col border-r border-slate-800 w-full md:w-[340px] ${
          activeChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-5 border-b border-slate-800 bg-slate-950 text-white text-xl font-bold">
          Messages
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-900">
          {connections.length === 0 ? (
            <p className="text-slate-500 text-sm text-center mt-6 px-4">
              Koi campaign-based conversation nahi hai abhi.
            </p>
          ) : (
            connections.map((u) => {
              const entryKey = getEntryKey(u);
              const isActive =
                activeChat?._id === u._id &&
                activeChat?.campaignId === u.campaignId;
              const isUnread = unread[entryKey] && !isActive;
              return (
                <div
                  key={entryKey}
                  onClick={() => handleSelectChat(u)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                    isActive
                      ? "bg-fuchsia-600/10 border-fuchsia-600/50"
                      : isUnread
                      ? "bg-slate-800/80 border-fuchsia-500/40"
                      : "bg-transparent border-transparent hover:bg-slate-800"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={u.avatar || u.logo || "https://placehold.co/50"}
                      className={`w-12 h-12 rounded-full object-cover border ${
                        isActive ? "border-fuchsia-500" : "border-slate-700"
                      }`}
                    />
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                        <span className="relative h-3.5 w-3.5 rounded-full bg-fuchsia-600 border-2 border-slate-900"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3
                        className={`font-semibold truncate ${
                          isUnread ? "text-fuchsia-400" : "text-white"
                        }`}
                      >
                        {u.name || u.businessName}
                      </h3>
                      {isUnread && (
                        <span className="text-[9px] bg-fuchsia-600 text-white px-1.5 py-0.5 rounded-full font-black">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-fuchsia-400/80 truncate">
                      {u.campaignName}
                    </p>
                    {lastMessages[entryKey] && (
                      <p
                        className={`truncate text-xs mt-0.5 ${
                          isUnread ? "text-slate-100 font-semibold" : "text-slate-500"
                        }`}
                      >
                        {lastMessages[entryKey]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div
        className={`flex-1 flex flex-col bg-slate-950 ${
          activeChat ? "flex" : "hidden md:flex"
        }`}
      >
        {activeChat ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-900/50">
              <button
                onClick={() => setActiveChat(null)}
                className="md:hidden text-white mr-2"
              >
                <FaArrowLeft />
              </button>
              <img
                src={activeChat.avatar || activeChat.logo || "https://placehold.co/40"}
                className="w-10 h-10 rounded-full object-cover border border-fuchsia-500"
              />
              <div>
                <h2 className="text-white font-bold">
                  {activeChat.name || activeChat.businessName}
                </h2>
                <p className="text-[11px] text-fuchsia-400/80">
                  {activeChat.campaignName}
                </p>
              </div>
            </div>
            <div ref={boxRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => {
                const isMe = (m.sender?._id || m.sender) === user._id;
                return (
                  <div
                    key={m._id || i}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "bg-fuchsia-600 text-white rounded-tr-none"
                          : "bg-slate-800 text-slate-100 rounded-tl-none"
                      }`}
                    >
                      <p>{m.text}</p>
                      <div className="text-[10px] opacity-50 text-right mt-1 flex justify-end items-center gap-1">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isMe && <span>{m.isRead ? "✓✓" : "✓"}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={send}
              className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-fuchsia-500 outline-none rounded-xl px-4 py-3 text-white"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-6 rounded-xl"
              >
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-600 font-medium">
            Select a contact to start messaging
          </div>
        )}
      </div>
    </div>
  );
}