import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "./NotificationContext.jsx";
import { AuthContext } from "./AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, ArrowUpRight } from "lucide-react";

export default function GlobalNotifications() {
  const { notifications, removeNotification } = useNotifications();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleNotificationClick = (alert) => {
    if (!alert.roomId || typeof alert.roomId !== "string" || !user || !user._id) {
      console.error("Invalid notification or user data:", alert);
      removeNotification(alert.id);
      return;
    }

    const parts = alert.roomId.split(":");
    if (parts.length < 4) {
      console.error("roomId format is incorrect:", alert.roomId);
      removeNotification(alert.id);
      return;
    }

    const [_, campId, user1, user2] = parts;
    const newOtherUserId = user1 === user._id ? user2 : user1;

    navigate(`/chats`);
    removeNotification(alert.id);
  };

  if (notifications.length === 0) return null;

  return (
    <div
      className="
        fixed z-[100] pointer-events-none 
        flex flex-col-reverse gap-3
        bottom-4 left-1/2 -translate-x-1/2
        sm:translate-x-0 sm:left-auto sm:right-6 sm:bottom-6 
        w-[90%] sm:w-[320px] md:w-[360px]
      "
    >
      <AnimatePresence>
        {notifications.slice().reverse().map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 120,
              duration: 0.4,
            }}
            className="
              relative w-full 
              bg-slate-800/95 
              border-t-2 border-fuchsia-500 
              text-white shadow-xl shadow-fuchsia-900/40 
              rounded-xl p-3 sm:p-4 flex flex-col space-y-2 
              pointer-events-auto cursor-pointer
              hover:bg-slate-700 hover:shadow-2xl 
              transition-all duration-200
              backdrop-blur-md
              active:scale-[0.98]
            "
            onClick={() => handleNotificationClick(a)}
          >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-y-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                <MessageCircle
                  size={18}
                  className="text-fuchsia-500 min-w-[18px]"
                />
                <span className="font-bold text-[0.75rem] sm:text-sm tracking-wide uppercase text-slate-50">
                  New Message
                </span>
              </div>

              {/* Timestamp */}
              <div className="text-[0.65rem] sm:text-xs text-slate-400 font-mono">
                {a.timestamp instanceof Date
                  ? a.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : a.timestamp}
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col text-[0.8rem] sm:text-sm leading-snug">
              <span className="font-bold text-fuchsia-500 truncate tracking-wide">
                {a.from}
              </span>
              <p className="text-slate-300 truncate max-w-full italic">
                {a.text}
              </p>
            </div>

            {/* Footer / Actions */}
            <div className="flex justify-end gap-3 sm:gap-4 pt-2 mt-1 border-t border-slate-700">
              <button
                className="
                  flex items-center gap-1 text-[0.7rem] sm:text-xs font-semibold 
                  text-fuchsia-500 hover:text-fuchsia-400 transition-colors
                "
                onClick={(e) => {
                  e.stopPropagation();
                  handleNotificationClick(a);
                }}
              >
                Respond <ArrowUpRight size={12} className="sm:size-[14px]" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(a.id);
                }}
                className="
                  text-slate-400 hover:text-white transition-colors 
                  text-[0.7rem] sm:text-xs hover:bg-red-600/50 
                  p-[3px] sm:p-1 rounded-md
                "
              >
                <X size={12} className="sm:size-[14px]" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
