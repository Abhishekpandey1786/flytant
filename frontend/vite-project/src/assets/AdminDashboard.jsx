import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaUsers, FaChartLine, FaDollarSign, FaCreditCard, 
  FaUserPlus, FaBullhorn, FaCheck, FaTimes 
} from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { BiImageAdd } from "react-icons/bi";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, payments: 0, newSignups: 0, revenue: 0 });
  const [notifications, setNotifications] = useState([]);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    link: "",
    imageFile: null,
  });

  const [userData, setUserData] = useState({ email: "", password: "" });
  const [creatingUser, setCreatingUser] = useState(false);

  const token = localStorage.getItem("adminToken");
  const API_BASE_URL = "https://vistafluence.onrender.com/api";

  // --- HELPER: Image URL Resolver ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
  };

  // --- API CALLS ---

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) { console.error("Stats fetch error"); }
  };

  const fetchPendingCampaigns = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/campaigns/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingCampaigns(res.data);
    } catch (err) { console.error("Campaigns fetch error"); }
  };

  const handleCampaignStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this campaign?`)) return;
    try {
      await axios.patch(`${API_BASE_URL}/admin/campaigns/${id}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingCampaigns(prev => prev.filter(c => c._id !== id));
      alert(`Campaign ${status.toUpperCase()} successfully!`);
    } catch (err) { alert("Action failed"); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await axios.post(`${API_BASE_URL}/academy/create-user`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User created and credentials mailed! ✅");
      setUserData({ email: "", password: "" });
    } catch (err) { alert(err.response?.data?.message || "Error creating user"); }
    setCreatingUser(false);
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) { console.error("Notifications fetch error"); }
  };

  const postNotification = async () => {
    const formData = new FormData();
    formData.append("title", newNotification.title);
    formData.append("message", newNotification.message);
    formData.append("link", newNotification.link);
    if (newNotification.imageFile) formData.append("image", newNotification.imageFile);

    try {
      await axios.post(`${API_BASE_URL}/admin/notifications`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      alert("Notification sent!");
      setNewNotification({ title: "", message: "", link: "", imageFile: null });
      fetchNotifications();
    } catch (err) { alert("Failed to send notification"); }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Delete notification?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) { alert("Delete failed"); }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/contact/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) { console.error("Messages fetch error"); }
  };

  useEffect(() => {
    if (token) {
      fetchStats(); fetchNotifications(); fetchMessages(); fetchPendingCampaigns();
      const interval = setInterval(() => {
        fetchStats(); fetchPendingCampaigns();
      }, 30000); // Har 30 sec me refresh
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
            Vistafluence <span className="text-fuchsia-600">Control Panel</span>
          </h1>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Users", val: stats.users, icon: <FaUsers/>, color: "text-cyan-400" },
            { label: "Payments", val: stats.payments, icon: <FaCreditCard/>, color: "text-green-400" },
            { label: "Signups", val: stats.newSignups, icon: <FaChartLine/>, color: "text-yellow-400" },
            { label: "Revenue", val: `$${stats.revenue}`, icon: <FaDollarSign/>, color: "text-fuchsia-400" }
          ].map((item, i) => (
            <div key={i} className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-2xl">
              <div className={`text-2xl ${item.color} mb-2`}>{item.icon}</div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{item.label}</p>
              <p className="text-3xl font-black mt-1">{item.val}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMN 1: PENDING CAMPAIGNS (FULL WIDTH IN MOBILE) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <FaBullhorn className="text-yellow-500 animate-pulse" /> PENDING CAMPAIGNS
            </h2>
            
            {pendingCampaigns.length === 0 ? (
              <div className="bg-slate-800/30 p-10 rounded-3xl border-2 border-dashed border-slate-700 text-center text-slate-500">
                Sari campaigns approved hain! ✅
              </div>
            ) : (
              pendingCampaigns.map((camp) => (
                <div key={camp._id} className="group bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 hover:border-fuchsia-500/50 transition-all">
                  <div className="flex flex-col md:flex-row">
                    {/* CAMPAIGN IMAGE CHECK */}
                    <div className="md:w-64 h-64 md:h-auto bg-slate-950 overflow-hidden">
                      {camp.imagePath ? (
                        <img 
                          src={getImageUrl(camp.imagePath)} 
                          alt="Verification" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 italic">No Image Uploaded</div>
                      )}
                    </div>
                    
                    {/* DETAILS */}
                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-2xl font-bold text-white leading-tight">{camp.name}</h3>
                          <span className="text-fuchsia-500 font-black text-lg">${camp.budget}</span>
                        </div>
                        <p className="text-cyan-400 text-sm font-bold mb-3 uppercase tracking-tighter">
                          Brand: {camp.createdBy?.businessName || "Individual Client"}
                        </p>
                        <p className="text-slate-400 text-sm line-clamp-3 mb-4">{camp.description}</p>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleCampaignStatus(camp._id, 'approved')}
                          className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <FaCheck /> APPROVE
                        </button>
                        <button 
                          onClick={() => handleCampaignStatus(camp._id, 'rejected')}
                          className="flex-1 bg-red-600 hover:bg-red-500 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <FaTimes /> REJECT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* COLUMN 2: TOOLS & NOTIFS */}
          <div className="space-y-8">
            
            {/* ACADEMY ACCESS */}
            <div className="bg-slate-800 p-6 rounded-3xl border-2 border-cyan-900/50 shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyan-400">
                <FaUserPlus/> MANUAL ACADEMY ACCESS
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <input 
                  type="email" placeholder="Email Address" 
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:border-cyan-500"
                  value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})}
                />
                <input 
                  type="text" placeholder="Password" 
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:border-cyan-500"
                  value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})}
                />
                <button 
                  disabled={creatingUser}
                  className="w-full bg-cyan-600 py-3 rounded-xl font-black hover:bg-cyan-500 transition-all disabled:opacity-30"
                >
                  {creatingUser ? "CREATING..." : "CREATE & SEND MAIL"}
                </button>
              </form>
            </div>

            {/* SEND NOTIFICATION */}
            <div className="bg-slate-800 p-6 rounded-3xl border-2 border-fuchsia-900/50">
              <h3 className="text-xl font-bold mb-4 text-fuchsia-500">PUSH NOTIFICATION</h3>
              <div className="space-y-3">
                <input 
                  type="text" placeholder="Title" 
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:border-fuchsia-500"
                  value={newNotification.title} onChange={e => setNewNotification({...newNotification, title: e.target.value})}
                />
                <textarea 
                  placeholder="Message..." 
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl outline-none focus:border-fuchsia-500 h-24"
                  value={newNotification.message} onChange={e => setNewNotification({...newNotification, message: e.target.value})}
                ></textarea>
                <label className="block w-full text-center py-3 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700/30 transition-all">
                  <span className="text-slate-400 text-sm flex items-center justify-center gap-2">
                    <BiImageAdd className="text-xl"/> {newNotification.imageFile ? newNotification.imageFile.name : "Add Image (Optional)"}
                  </span>
                  <input type="file" className="hidden" onChange={e => setNewNotification({...newNotification, imageFile: e.target.files[0]})} />
                </label>
                <button 
                  onClick={postNotification}
                  className="w-full bg-fuchsia-700 py-3 rounded-xl font-black hover:bg-fuchsia-600 transition-all shadow-lg shadow-fuchsia-900/40"
                >
                  BLAST NOTIFICATION
                </button>
              </div>
            </div>

            {/* MESSAGES PREVIEW */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold tracking-widest text-slate-500 uppercase">Latest Contact Messages</h3>
              {messages.slice(0, 5).map(m => (
                <div key={m._id} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-cyan-500 font-bold">{m.email}</p>
                  <p className="text-sm text-slate-300 mt-1 italic">"{m.message}"</p>
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