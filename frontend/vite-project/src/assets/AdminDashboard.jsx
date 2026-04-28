import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaChartLine, FaDollarSign, FaCreditCard, FaUserPlus, FaBullhorn, FaCheck, FaTimes } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { BiImageAdd } from "react-icons/bi";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, payments: 0, newSignups: 0, revenue: 0 });
  const [notifications, setNotifications] = useState([]);
  const [pendingCampaigns, setPendingCampaigns] = useState([]); // 🔥 Naya State
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    link: "",
    imageFile: null,
  });
  const [messages, setMessages] = useState([]);

  // --- Manual User Creation State ---
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [creatingUser, setCreatingUser] = useState(false);

  const token = localStorage.getItem("adminToken");
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http") || imagePath.startsWith("https")) return imagePath;
    return `https://vistafluence.onrender.com${imagePath}`;
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("https://vistafluence.onrender.com/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        users: res.data.users,
        payments: res.data.payments,
        newSignups: res.data.newSignups || 0, 
        revenue: res.data.revenue || 0, 
      });
    } catch (err) { console.error("Error fetching stats:", err); }
  };

  // 🔥 NAYA FUNCTION: Pending Campaigns Fetch Karna
  const fetchPendingCampaigns = async () => {
    try {
      const res = await axios.get("https://vistafluence.onrender.com/api/admin/campaigns/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingCampaigns(res.data);
    } catch (err) { console.error("Error fetching campaigns:", err); }
  };

  // 🔥 NAYA FUNCTION: Approve ya Reject Karna
  const handleCampaignStatus = async (id, status) => {
    try {
      await axios.patch(`https://vistafluence.onrender.com/api/admin/campaigns/${id}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingCampaigns(prev => prev.filter(c => c._id !== id));
      alert(`Campaign ${status} successfully!`);
    } catch (err) { alert("Status update failed"); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!userData.email || !userData.password) return alert("Bhai, email aur password dono likho!");
    setCreatingUser(true);
    try {
      const res = await axios.post("https://vistafluence.onrender.com/api/academy/create-user", userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        alert(res.data.message || "Chaka-chak! User ban gaya aur mail chala gaya. ✅");
        setUserData({ email: "", password: "" });
      }
    } catch (err) {
      const errorDetail = err.response?.data?.message || "Shayad backend setup nahi hai ya internet issue hai.";
      alert(`Error: ${errorDetail}`);
    }
    setCreatingUser(false);
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("https://vistafluence.onrender.com/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) { console.error("Error fetching notifications:", err); }
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
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setNewNotification({ title: "", message: "", link: "", imageFile: null });
      fetchNotifications(); 
      alert("Notification sent!");
    } catch (err) { console.error("Error posting notification:", err); }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure to delete this notification?")) return;
    try {
      await axios.delete(`https://vistafluence.onrender.com/api/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications(); 
      alert("Notification deleted!");
    } catch (err) { console.error("Error deleting notification:", err); }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get("https://vistafluence.onrender.com/api/contact/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) { console.error("Error fetching messages:", err); }
  };

  useEffect(() => {
    if (token) {
      fetchStats(); fetchNotifications(); fetchMessages(); fetchPendingCampaigns();
      const intervalId = setInterval(() => {
        fetchStats(); fetchNotifications(); fetchMessages(); fetchPendingCampaigns();
      }, 15000); 
      return () => clearInterval(intervalId);
    }
  }, [token]); 

  return (
    <div className="min-h-screen p-8 bg-slate-800 text-white relative overflow-hidden">
      {/* Background Stying */}
      <style jsx="true">{`
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-12 text-center drop-shadow-lg tracking-wide">
          <span className="bg-clip-text text-transparent bg-white">Vistafluence Admin</span>
        </h1>

        {/* --- STATS SECTION --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center border-2 border-fuchsia-800 shadow-xl shadow-fuchsia-900/20">
            <div className="text-4xl mb-3 text-cyan-300 flex justify-center"><FaUsers /></div>
            <h2 className="text-xl">Total Users</h2>
            <p className="text-5xl font-bold mt-3">{stats.users}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center border-2 border-fuchsia-800 shadow-xl shadow-fuchsia-900/20">
            <div className="text-4xl mb-3 text-green-300 flex justify-center"><FaCreditCard /></div>
            <h2 className="text-xl">Total Payments</h2>
            <p className="text-5xl font-bold mt-3">{stats.payments}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center border-2 border-fuchsia-800 shadow-xl shadow-fuchsia-900/20">
            <div className="text-4xl mb-3 text-yellow-300 flex justify-center"><FaChartLine /></div>
            <h2 className="text-xl">New Signups</h2>
            <p className="text-5xl font-bold mt-3">{stats.newSignups}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center border-2 border-fuchsia-800 shadow-xl shadow-fuchsia-900/20">
            <div className="text-4xl mb-3 text-fuchsia-300 flex justify-center"><FaDollarSign /></div>
            <h2 className="text-xl">Total Revenue</h2>
            <p className="text-5xl font-bold mt-3">${stats.revenue}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT SIDE: TOOLS --- */}
          <div className="lg:col-span-1 space-y-8">
            {/* Academy Access */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-cyan-500">
              <div className="flex items-center space-x-3 mb-6 text-cyan-300">
                <FaUserPlus className="text-2xl" />
                <h2 className="text-2xl font-semibold">Academy Access</h2>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <input
                  type="email" placeholder="Student Email" required
                  className="w-full p-4 rounded-xl bg-white/5 border-2 border-fuchsia-800 outline-none focus:border-cyan-400"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                />
                <input
                  type="text" placeholder="Manual Password" required
                  className="w-full p-4 rounded-xl bg-white/5 border-2 border-fuchsia-800 outline-none focus:border-cyan-400"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                />
                <button type="submit" disabled={creatingUser} className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-xl font-bold">
                  {creatingUser ? "Creating..." : "Create & Mail Access"}
                </button>
              </form>
            </div>

            {/* Send Notification */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-fuchsia-800">
              <h2 className="text-2xl font-semibold mb-6">Send Notification</h2>
              <div className="space-y-5">
                <input type="text" placeholder="Notification Title" value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  className="w-full p-4 rounded-xl bg-white/5 border-2 border-fuchsia-800" />
                <textarea rows="3" placeholder="Message" value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  className="w-full p-4 rounded-xl bg-white/5 border-2 border-fuchsia-800"></textarea>
                <input type="text" placeholder="Link" value={newNotification.link}
                  onChange={(e) => setNewNotification({ ...newNotification, link: e.target.value })}
                  className="w-full p-4 rounded-xl bg-white/5 border-2 border-fuchsia-800" />
                <label className="flex items-center space-x-3 w-full p-4 rounded-xl bg-white/5 border border-white/20 cursor-pointer">
                  <BiImageAdd className="text-2xl" />
                  <span>{newNotification.imageFile ? newNotification.imageFile.name : "Image (Optional)"}</span>
                  <input type="file" onChange={(e) => setNewNotification({ ...newNotification, imageFile: e.target.files[0] })} className="hidden" />
                </label>
                <button onClick={postNotification} className="w-full bg-fuchsia-700 py-4 rounded-xl font-bold">Send Now</button>
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: CAMPAIGNS & NOTIFS --- */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* 🔥 CAMPAIGN APPROVAL SECTION (Naya Integrated) */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <FaBullhorn className="text-yellow-400" /> Pending Campaigns Approval
              </h2>
              {pendingCampaigns.length === 0 ? (
                <div className="p-10 bg-white/5 rounded-3xl border border-white/10 text-center text-slate-500 italic">
                  Sab clear hai! Koi pending campaign nahi hai.
                </div>
              ) : (
                pendingCampaigns.map((camp) => (
                  <div key={camp._id} className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border-2 border-slate-700 hover:border-fuchsia-500 transition-all shadow-xl">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">{camp.name}</h3>
                        <p className="text-fuchsia-400 font-medium">Brand: {camp.createdBy?.businessName || camp.createdBy?.name}</p>
                        <p className="text-slate-400 text-sm">{camp.description}</p>
                        <div className="flex gap-3 mt-3">
                          <span className="bg-slate-800 px-3 py-1 rounded text-xs">Budget: ${camp.budget}</span>
                          <span className="bg-slate-800 px-3 py-1 rounded text-xs">Niche: {camp.requiredNiche?.[0]}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleCampaignStatus(camp._id, 'approved')} className="p-4 bg-green-600 rounded-2xl hover:bg-green-500 shadow-lg shadow-green-900/20"><FaCheck/></button>
                        <button onClick={() => handleCampaignStatus(camp._id, 'rejected')} className="p-4 bg-red-600 rounded-2xl hover:bg-red-500 shadow-lg shadow-red-900/20"><FaTimes/></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Notifications List */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Live Notifications</h2>
              {notifications.map((n) => (
                <div key={n._id} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-fuchsia-800/30">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-xl">{n.title}</h3>
                      <p className="text-gray-300 mt-1">{n.message}</p>
                    </div>
                    <button onClick={() => deleteNotification(n._id)} className="text-white bg-red-600 p-2 rounded-xl h-fit"><MdDeleteForever /></button>
                  </div>
                  {n.image && <img src={getImageUrl(n.image)} alt="notif" className="mt-4 rounded-xl w-full max-h-48 object-cover" />}
                </div>
              ))}
            </div>
            
            {/* Contact Messages */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">User Messages</h2>
              {messages.map((msg) => (
                <div key={msg._id} className="p-5 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex justify-between text-sm text-cyan-400 mb-2">
                    <span>{msg.name}</span>
                    <span>{msg.email}</span>
                  </div>
                  <p className="text-slate-300 italic">"{msg.message}"</p>
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