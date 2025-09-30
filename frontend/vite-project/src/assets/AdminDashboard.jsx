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

  // ✅ NEW: Utility function to handle dynamic image URLs (Cloudinary vs Local)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Check if it's already a full URL (likely Cloudinary or external)
    if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
      return imagePath;
    }
    // Assume it's a local path and prefix the backend base URL
    return `http://localhost:5000${imagePath}`;
  };
  // ✅ END NEW

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        users: res.data.users,
        payments: res.data.payments,
        newSignups: 0,
        revenue: 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
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
      await axios.post("http://localhost:5000/api/admin/notifications", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setNewNotification({ title: "", message: "", link: "", imageFile: null });
      fetchNotifications();
      alert("Notification sent!");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure to delete this notification?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
      alert("Notification deleted!");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/contact/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchNotifications();
      fetchMessages();
    }
  }, [token]);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-900 via-gray-950 to-purple-900 text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-3/4 left-3/4 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-12 text-center drop-shadow-lg tracking-wide">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-fuchsia-300">
            Admin Dashboard
          </span>
        </h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center border border-white/20">
            <div className="text-4xl mb-3 text-cyan-300"><FaUsers /></div>
            <h2 className="text-xl">Total Users</h2>
            <p className="text-5xl font-bold mt-3">{stats.users}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center border border-white/20">
            <div className="text-4xl mb-3 text-green-300"><FaCreditCard /></div>
            <h2 className="text-xl">Total Payments</h2>
            <p className="text-5xl font-bold mt-3">{stats.payments}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center border border-white/20">
            <div className="text-4xl mb-3 text-yellow-300"><FaChartLine /></div>
            <h2 className="text-xl">New Signups</h2>
            <p className="text-5xl font-bold mt-3">{stats.newSignups}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center border border-white/20">
            <div className="text-4xl mb-3 text-fuchsia-300"><FaDollarSign /></div>
            <h2 className="text-xl">Total Revenue</h2>
            <p className="text-5xl font-bold mt-3">${stats.revenue}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notification Form */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6">Send Notification</h2>
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Notification Title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white"
              />
              <textarea
                rows="3"
                placeholder="Message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white"
              ></textarea>
              <input
                type="text"
                placeholder="Link (optional)"
                value={newNotification.link}
                onChange={(e) => setNewNotification({ ...newNotification, link: e.target.value })}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white"
              />
              <label className="flex items-center space-x-3 w-full p-4 rounded-xl bg-white/5 border border-white/20 text-gray-300 cursor-pointer">
                <BiImageAdd className="text-2xl" />
                <span>{newNotification.imageFile ? newNotification.imageFile.name : "Choose an image"}</span>
                <input
                  type="file"
                  onChange={(e) => setNewNotification({ ...newNotification, imageFile: e.target.files[0] })}
                  className="hidden"
                />
              </label>
              <button
                onClick={postNotification}
                className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold text-lg"
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
              {notifications.map((n) => (
                <div key={n._id} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
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
                      className="text-white bg-red-600 p-2 rounded-xl hover:bg-red-700"
                    >
                      <MdDeleteForever className="text-xl" />
                    </button>
                  </div>
                  {n.image && (
                    // ✅ UPDATED: Use getImageUrl function for dynamic path handling
                    <img src={getImageUrl(n.image)} alt="notif" className="mt-4 rounded-xl w-full max-h-60 object-cover" />
                  )}
                </div>
              ))}
            </div>

            {/* Contact Messages */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-3">Contact Messages</h2>
              {messages.map((msg) => (
                <div key={msg._id} className="p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
                  <p><strong>Name:</strong> {msg.name}</p>
                  <p><strong>Email:</strong> {msg.email}</p>
                  <p><strong>Message:</strong> {msg.message}</p>
                  <p className="text-gray-400 text-sm mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;