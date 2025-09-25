import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiBell } from "react-icons/fi";
import { FaRegBell } from "react-icons/fa";

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "https://influezone.onrender.com/api/admin/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data.map((n) => ({
        ...n,
        isRead: Math.random() > 0.5, // demo
      }));
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 px-4 sm:px-6 lg:px-10 py-10">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiBell className="text-4xl text-fuchsia-400 drop-shadow-[0_0_10px_rgba(255,100,255,0.6)]" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-fuchsia-500 text-xs px-2 rounded-full text-white shadow-md">
                  {notifications.length}
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-wide">
              Notifications
            </h2>
          </div>

          {notifications.length > 0 && (
            <div className="bg-fuchsia-500/10 border border-fuchsia-400/40 text-fuchsia-300 px-5 py-2 rounded-full text-sm font-medium shadow-md">
              {notifications.length} New
            </div>
          )}
        </div>

        {/* Loading / Empty */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-fuchsia-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-lg">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gray-900/60 rounded-3xl shadow-2xl border border-gray-800 backdrop-blur-md">
            <FaRegBell className="text-6xl text-gray-600 mb-4" />
            <p className="text-xl font-semibold text-gray-300">No Notifications</p>
            <p className="text-md mt-1 text-gray-500">
              You're all caught up for now.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-800"></div>

            {notifications.map((n, idx) => (
              <div
                key={n._id || idx}
                className={`relative bg-gray-800/50 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border-l-4 ${
                  n.isRead
                    ? "border-gray-600 opacity-75"
                    : "border-fuchsia-500"
                }`}
              >
                {/* Dot */}
                <div className="absolute -left-[21px] top-6 w-4 h-4 rounded-full border-2 border-gray-900 bg-fuchsia-400 shadow-md"></div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold text-lg sm:text-xl text-white">
                    {n.title}
                  </h3>

                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed break-words">
                    {n.message}
                  </p>

                  {n.link && (
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fuchsia-400 hover:text-fuchsia-300 underline text-sm font-medium mt-1"
                    >
                      View Details
                    </a>
                  )}

                  {n.image && (
                    <img
                      src={`https://influezone.onrender.com${n.image}`}
                      alt="notification"
                      className="mt-3 rounded-xl w-full max-h-60 object-cover border border-gray-700 shadow"
                    />
                  )}

                  <span className="text-xs sm:text-sm text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;
