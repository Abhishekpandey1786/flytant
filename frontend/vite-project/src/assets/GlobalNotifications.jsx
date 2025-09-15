import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "./NotificationContext.jsx";
import { AuthContext } from "./AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare } from "lucide-react";

export default function GlobalNotifications() {
  const { notifications, removeNotification } = useNotifications();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleNotificationClick = (alert) => {
    const [_, campId, user1, user2] = alert.roomId.split(":");
    const newOtherUserId = user1 === user._id ? user2 : user1;

    navigate(); // aap yaha route pass karoge jaise `/chats/${campId}?user=${newOtherUserId}`
    removeNotification(alert.id);
  };

  if (notifications.length === 0) return null;

  return (
    <div
      className="
        fixed z-[100] space-y-4 pointer-events-none
        sm:top-6 sm:right-6 
        sm:w-auto
        bottom-4 left-1/2 -translate-x-1/2 w-[95%] sm:translate-x-0
      "
    >
      <AnimatePresence>
        {notifications.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="
              relative w-full sm:max-w-sm sm:w-[320px]
              backdrop-blur-lg bg-white/80 border border-gray-300 
              shadow-2xl rounded-2xl p-4 flex flex-col space-y-2 
              pointer-events-auto cursor-pointer
              hover:shadow-3xl hover:scale-[1.02] transition-all
            "
            onClick={() => handleNotificationClick(a)}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-500/20 text-blue-600">
                  <MessageSquare size={18} />
                </div>
                <span className="font-semibold text-gray-800 text-base">
                  New Message
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(a.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="text-sm text-gray-700 leading-snug">
              <span className="font-medium text-gray-900">{a.from}</span>: {a.text}
            </div>

            {/* Footer */}
            <div className="text-xs text-right text-gray-500 opacity-75">
              {a.timestamp instanceof Date
                ? a.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : a.timestamp}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
