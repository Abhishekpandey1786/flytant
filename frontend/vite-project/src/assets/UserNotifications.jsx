import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FiBell } from "react-icons/fi";
import { FaRegBell, FaCheckCircle } from "react-icons/fa";
import { IoEyeOff } from "react-icons/io5"; 

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ 1. 'token' वेरिएबल को हटा दिया गया है
  // ⚠️ सुनिश्चित करें कि आपके बैकएंड में यह रूट पब्लिक हो
  const API_URL = "https://vistafluence.onrender.com/api/notifications";


  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
  
    return `https://vistafluence.onrender.com${imagePath}`;
  };

  // isRead स्टेटस अब केवल क्लाइंट-साइड (Browser Session) के लिए होगा,
  // क्योंकि हम इसे डेटाबेस में प्रति-यूज़र सेव नहीं कर रहे हैं।
  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.isRead);
  }, [notifications]);

  
  const fetchNotifications = async () => {
    // ❌ 2. टोकन चेक हटा दिया गया है
    // if (!token) { setError("..."); setLoading(false); return; }
    
    if (notifications.length === 0) setLoading(true); 

    try {
      // ✅ 3. Axios कॉल से Authorization हेडर हटा दिया गया है
      const res = await axios.get(API_URL);

      const data = res.data.map((n) => ({
        ...n,
        // पब्लिक नोटिफिकेशन में isRead को डिफ़ॉल्ट रूप से false सेट करें
        isRead: false, 
        imageSrc: getImageUrl(n.image), 
      }));

      
      setNotifications(data.reverse()); 
      setError(null);
    } catch (err) {
      console.error("Notification fetch error:", err.response?.data || err.message);
      
      // ❌ 4. Admin-specific error handling हटा दिया गया है
      setError("⚠️ Failed to load public notifications from the server.");
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ ध्यान दें: ये फ़ंक्शन केवल फ्रंटएंड स्टेट बदलते हैं, डेटाबेस नहीं।
  const markAsRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  // ✅ 5. useEffect dependency array खाली है, यह टोकन पर निर्भर नहीं करेगा
  useEffect(() => {
    fetchNotifications();
    // Polling: हर 30 सेकंड में नई पब्लिक नोटिफिकेशन ले लेगा।
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []); // <--- dependency array अब खाली है

  // --- Render Logic ---
  
  if (error && !loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-red-400 p-6 bg-red-900/40 rounded-xl shadow-md border border-red-700">
        <p className="text-xl font-semibold mb-2">Error Loading Notifications</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 px-4 sm:px-6 lg:px-10 py-10">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 sm:mb-12 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiBell className="text-4xl text-fuchsia-400 drop-shadow-[0_0_10px_rgba(255,100,255,0.6)]" />
              {unreadNotifications.length > 0 && ( // ✅ Unread count
                <span className="absolute -top-1 -right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full text-white font-bold shadow-md animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-wide">
              Notifications
            </h2>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-4">
                {unreadNotifications.length > 0 && (
                    <div className="bg-red-500/10 border border-red-400/40 text-red-300 px-4 py-1.5 rounded-full text-sm font-semibold shadow-md min-w-[70px] text-center">
                        {unreadNotifications.length} Unread
                    </div>
                )}
                
                <button
                    onClick={markAllAsRead}
                    disabled={unreadNotifications.length === 0}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full transition duration-300 bg-fuchsia-800 hover:bg-fuchsia-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    <FaCheckCircle size={14} /> Mark All Read
                </button>
            </div>
          )}
        </div>
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
          
          <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8"> 
            
          
            <div className="absolute left-2 sm:left-4 top-0 bottom-0 w-0.5 bg-gray-800"></div>

            {notifications.map((n, idx) => (
              <div
                key={n._id || idx}
                className={`relative backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border-l-4 ${
                  n.isRead
                    ? "border-gray-700 opacity-70 bg-gray-800/50" // Read
                    : "border-fuchsia-500 bg-gray-800/80" // Unread
                }`}
              >
                <div 
                    className={`absolute -left-[18px] sm:-left-[21px] top-4 sm:top-5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-gray-950 ${n.isRead ? 'bg-gray-600' : 'bg-fuchsia-400 shadow-fuchsia-400/80 shadow-md animate-pulse-slow'}`}
                ></div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg sm:text-xl text-white break-words pr-2">
                      {n.title}
                    </h3>
                    {!n.isRead && (
                        <button
                            onClick={() => markAsRead(n._id)}
                            className="text-fuchsia-400 hover:text-fuchsia-300 transition shrink-0 ml-auto p-1 rounded-full hover:bg-gray-700"
                            title="Mark as Read"
                        >
                            <IoEyeOff size={20} />
                        </button>
                    )}
                  </div>


                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed break-words">
                    {n.message}
                  </p>

                  {n.imageSrc && ( 
                    <img
                      src={n.imageSrc} 
                      alt="notification asset"
                    
                      className="mt-3 rounded-xl w-full max-h-48 sm:max-h-60 object-cover border border-gray-700 shadow"
                    />
                  )}
                  
                  {n.link && (
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fuchsia-400 hover:text-fuchsia-300 underline text-sm font-medium mt-1 w-fit"
                    >
                      View Details
                    </a>
                  )}

                  <span className="text-xs sm:text-sm text-gray-500 mt-2">
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