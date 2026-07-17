import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "./NotificationContext.jsx";
import { AuthContext } from "./AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, ArrowUpRight } from "lucide-react";

export default function GlobalNotifications() {
  const { notifications, removeNotification, markAsRead } = useNotifications();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleNotificationClick = (alert) => {
    if (!alert.roomId || typeof alert.roomId !== "string" || !user?._id) {
      console.error("Invalid notification or user data:", alert);
      removeNotification(alert.id);
      return;
    }

    // roomId format: camp:<campaignId>:<userA>:<userB>
    const parts = alert.roomId.split(":");
    if (parts.length < 4) {
      console.error("roomId format is incorrect:", alert.roomId);
      removeNotification(alert.id);
      return;
    }

    const campaignId = parts[1];
    const user1 = parts[2];
    const user2 = parts[3];
    const otherUserId = user1 === user._id ? user2 : user1;

    if (alert.senderId) markAsRead(alert.senderId);

    navigate(`/chats/campaign/${campaignId}/user/${otherUserId}`);
    removeNotification(alert.id);
  };

  if (notifications.length === 0) return null;

  return (
    <div
      className="
        fixed z-[100]
        pointer-events-none
        flex flex-col-reverse gap-3
        bottom-4 left-1/2 -translate-x-1/2
        sm:left-auto sm:right-6 sm:bottom-6 sm:translate-x-0
        w-[90%] sm:w-[320px] md:w-[360px]
      "
    >
      <AnimatePresence>
        {notifications
          .slice()
          .reverse()
          .map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 15, stiffness: 120 }}
              className="
                relative w-full
                bg-slate-800/95 backdrop-blur-md
                border border-slate-700 border-t-2 border-t-fuchsia-500
                rounded-2xl p-4
                shadow-2xl shadow-fuchsia-900/40
                pointer-events-auto cursor-pointer
                hover:bg-slate-700/95 hover:shadow-fuchsia-700/30
                transition-all duration-300
                active:scale-[0.98]
              "
              onClick={() => handleNotificationClick(a)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-fuchsia-600/20 flex items-center justify-center">
                    <MessageCircle size={18} className="text-fuchsia-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-widest text-fuchsia-400 font-bold">
                      New Message
                    </span>
                    <span className="text-sm text-slate-400">Tap to open chat</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(a.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/20 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-fuchsia-400 font-bold text-sm truncate">
                  {a.from || a.senderName || a.businessName || "New Message"}
                </div>
                <p className="text-slate-200 text-sm leading-relaxed line-clamp-2 break-words">
                  {a.text}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
                <span className="text-[11px] text-slate-500 font-mono">
                  {a.timestamp instanceof Date
                    ? a.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : a.timestamp}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotificationClick(a);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-all"
                >
                  Respond
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}