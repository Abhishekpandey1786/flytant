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

  // Authorization token को हर function में pass करें, यहाँ नहीं
  const token = localStorage.getItem("adminToken");

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        // यहाँ backend से आने वाले सही key names का उपयोग करें
        users: res.data.users,
        payments: res.data.payments,
        // यह डेटा backend से नहीं आ रहा है
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

  useEffect(() => {
    // यह token के मौजूद होने पर ही fetch करेगा
    if (token) {
      fetchStats();
      fetchNotifications();
    }
  }, [token]); // `token` को dependency array में जोड़ा गया है

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-900 via-gray-950 to-purple-900 text-white">
      {/* Container for the frosted glass effect */}
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

        {/* Stats Section with Glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-white/20 text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="text-4xl mb-3 flex justify-center text-cyan-300 drop-shadow-md"><FaUsers /></div>
            <h2 className="text-xl font-semibold text-gray-200">Total Users</h2>
            <p className="text-5xl font-bold mt-3 text-white drop-shadow-lg">{stats.users}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-white/20 text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="text-4xl mb-3 flex justify-center text-green-300 drop-shadow-md"><FaCreditCard /></div>
            <h2 className="text-xl font-semibold text-gray-200">Total Payments</h2>
            <p className="text-5xl font-bold mt-3 text-white drop-shadow-lg">{stats.payments}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-white/20 text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="text-4xl mb-3 flex justify-center text-yellow-300 drop-shadow-md"><FaChartLine /></div>
            <h2 className="text-xl font-semibold text-gray-200">New Signups</h2>
            <p className="text-5xl font-bold mt-3 text-white drop-shadow-lg">{stats.newSignups}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-white/20 text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="text-4xl mb-3 flex justify-center text-fuchsia-300 drop-shadow-md"><FaDollarSign /></div>
            <h2 className="text-xl font-semibold text-gray-200">Total Revenue</h2>
            <p className="text-5xl font-bold mt-3 text-white drop-shadow-lg">${stats.revenue}</p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notification Form */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-3xl shadow-lg p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6 text-white drop-shadow-md">Send Notification</h2>
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Notification Title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300 transition"
              />
              <textarea
                rows="3"
                placeholder="Message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300 transition"
              ></textarea>
              <input
                type="text"
                placeholder="Link (optional)"
                value={newNotification.link}
                onChange={(e) => setNewNotification({ ...newNotification, link: e.target.value })}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-300 transition"
              />
              <label className="flex items-center space-x-3 w-full p-4 rounded-xl bg-white/5 border border-white/20 text-gray-300 cursor-pointer transition">
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
                className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg"
              >
                Send Notification
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-6">
            {notifications.map((n) => (
              <div key={n._id} className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-lg p-6 relative border border-white/20 transform transition duration-300 hover:scale-[1.01] hover:shadow-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    {n.title && <h3 className="font-bold text-xl text-white drop-shadow-sm">{n.title}</h3>}
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
                    className="text-white bg-red-600 hover:bg-red-700 p-2 rounded-xl text-sm font-semibold transition-transform transform hover:scale-110"
                  >
                    <MdDeleteForever className="text-xl" />
                  </button>
                </div>
                {n.image && (
                  <img
                    src={`http://localhost:5000${n.image}`}
                    alt="notif"
                    className="mt-4 rounded-xl w-full max-h-60 object-cover border border-white/20"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;