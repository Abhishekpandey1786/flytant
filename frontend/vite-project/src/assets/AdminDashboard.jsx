import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaChartLine, FaDollarSign, FaCreditCard } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { BiImageAdd } from "react-icons/bi";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, payments: 0, newSignups: 0, revenue: 0 });
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    link: "",
    imageFile: null,
  });
  const [messages, setMessages] = useState([]);

  const token = localStorage.getItem("adminToken");

  // Utility function to handle dynamic image URLs (Cloudinary vs Local)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Check if it's already a full URL (likely Cloudinary or external)
    if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
      return imagePath;
    }
    // Assume it's a local path and prefix the backend base URL
    return `https://vistafluence.onrender.com${imagePath}`;
  };
  // END Utility

  const fetchStats = async () => {
    try {
      const res = await axios.get("https://vistafluence.onrender.com/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        users: res.data.users,
        payments: res.data.payments,
        newSignups: res.data.newSignups || 0, // Assuming backend might send this later
        revenue: res.data.revenue || 0, // Assuming backend might send this later
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("https://vistafluence.onrender.com/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const postNotification = async () => {
    if (!newNotification.title && !newNotification.message && !newNotification.imageFile) return;

    const formData = new FormData();
    formData.append("title", newNotification.title);
    formData.append("message", newNotification.message);
    formData.append("link", newNotification.link || "");
    if (newNotification.imageFile) formData.append("image", newNotification.imageFile);

    try {
      await axios.post("https://vistafluence.onrender.com/api/admin/notifications", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setNewNotification({ title: "", message: "", link: "", imageFile: null });
      fetchNotifications(); // Notification post होने के बाद तुरंत डेटा फेच करें
      alert("Notification sent!");
    } catch (err) {
      console.error("Error posting notification:", err);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure to delete this notification?")) return;
    try {
      await axios.delete(`https://vistafluence.onrender.com/api/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications(); // Notification delete होने के बाद तुरंत डेटा फेच करें
      alert("Notification deleted!");
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get("https://vistafluence.onrender.com/api/contact/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // ✅ UPDATED: useEffect with Polling
  useEffect(() => {
    if (token) {
      // 1. Component mount होने पर पहली बार तुरंत डेटा फेच करें
      fetchStats();
      fetchNotifications();
      fetchMessages();

      // 2. हर 10 सेकंड में ऑटो-रिफ्रेश (Polling) सेट करें
      const intervalId = setInterval(() => {
        fetchStats();
        fetchNotifications();
        fetchMessages();
        console.log("Dashboard data refreshed automatically.");
      }, 10000); // 10000ms = 10 सेकंड (आप अपनी ज़रूरत के हिसाब से समय बदल सकते हैं)

      // 3. Component Unmount होने पर Interval को साफ (Clear) करें
      // यह बहुत ज़रूरी है, नहीं तो मेमोरी लीक होगी।
      return () => clearInterval(intervalId);
    }
  }, [token]); // token change होने पर ही यह effect दोबारा चलेगा

  return (
    <div className="min-h-screen p-8 bg-slate-800 text-white">
      <div className="absolute inset-0 z-0">
        <style jsx="true">{`
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
        `}</style>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-slate-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-3/4 left-3/4 w-72 h-72 bg-slate-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-12 text-center drop-shadow-lg tracking-wide">
          <span className="bg-clip-text text-transparent bg-white">
            Admin Dashboard
          </span>
        </h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 ">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center  neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800">
            <div className="text-4xl mb-3 text-cyan-300"><FaUsers /></div>
            <h2 className="text-xl">Total Users</h2>
            <p className="text-5xl font-bold mt-3">{stats.users}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center  neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800">
            <div className="text-4xl mb-3 text-green-300"><FaCreditCard /></div>
            <h2 className="text-xl">Total Payments</h2>
            <p className="text-5xl font-bold mt-3">{stats.payments}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800">
            <div className="text-4xl mb-3 text-yellow-300"><FaChartLine /></div>
            <h2 className="text-xl">New Signups</h2>
            <p className="text-5xl font-bold mt-3">{stats.newSignups}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800">
            <div className="text-4xl mb-3 text-fuchsia-300"><FaDollarSign /></div>
            <h2 className="text-xl">Total Revenue</h2>
            <p className="text-5xl font-bold mt-3">${stats.revenue}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notification Form */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-3xl p-8 neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800">
            <h2 className="text-2xl font-semibold mb-6">Send Notification</h2>
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Notification Title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                className="w-full p-4 rounded-xl bg-white/5  text-white neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800"
              />
              <textarea
                rows="3"
                placeholder="Message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                className="w-full p-4 rounded-xl bg-white/5  text-white neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800"
              ></textarea>
              <input
                type="text"
                placeholder="Link (optional)"
                value={newNotification.link}
                onChange={(e) => setNewNotification({ ...newNotification, link: e.target.value })}
                className="w-full p-4 rounded-xl bg-white/5 neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 text-white"
              />
              <label className="flex items-center space-x-3 w-full p-4 rounded-xl bg-white/5 border border-white/20 text-gray-300 cursor-pointer">
                <BiImageAdd className="text-2xl" />
                <span>{newNotification.imageFile ? newNotification.imageFile.name : "Choose an image"}</span>
                <input
                  type="file"
                  onChange={(e) => setNewNotification({ ...newNotification, imageFile: e.target.files[0] })}
                  className="hidden "
                />
              </label>
              <button
                onClick={postNotification}
                className="w-full bg-fuchsia-700 text-white py-4 rounded-xl font-bold text-lg hover:active:scale-95 transition duration-300"
              >
                Send Notification
              </button>
            </div>
          </div>

          {/* Notifications + Messages */}
          <div className="lg:col-span-2 space-y-8">
            {/* Notifications List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-3">Notifications</h2>
              {notifications.length === 0 ? (
                <p className="text-gray-400">No notifications available.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6  neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800">
                    <div className="flex justify-between">
                      <div>
                        {n.title && <h3 className="font-bold text-xl">{n.title}</h3>}
                        {n.message && <p className="text-gray-200 mt-1">{n.message}</p>}
                        {n.link && (
                          <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline mt-2 inline-block">
                            Open Link
                          </a>
                        )}
                        <span className="text-sm text-gray-400 block mt-3">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => deleteNotification(n._id)}
                        className="text-white bg-red-600 p-2 rounded-xl hover:bg-red-700 hover:active:scale-75 transition duration-300"
                      >
                        <MdDeleteForever className="text-xl" />
                      </button>
                    </div>
                    {n.image && (
                      <img src={getImageUrl(n.image)} alt="notif" className="mt-4 rounded-xl w-full max-h-60 object-cover" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Contact Messages */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-3">Contact Messages</h2>
              {messages.length === 0 ? (
                <p className="text-gray-400">No contact messages available.</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className="p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
                    <p><strong>Name:</strong> {msg.name}</p>
                    <p><strong>Email:</strong> {msg.email}</p>
                    <p><strong>Message:</strong> {msg.message}</p>
                    <p className="text-gray-400 text-sm mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;