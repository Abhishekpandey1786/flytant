import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaChartLine, FaDollarSign, FaCreditCard, FaUserPlus, FaBullhorn, FaCheck, FaTimes, FaEnvelope } from "react-icons/fa";
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `https://vistafluence.onrender.com${imagePath}`;
  };

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

  // UPDATED LOGIC FOR REJECTION ALERT
  const handleCampaignStatus = async (id, status) => {
    let feedback = "";
    
    if (status === 'rejected') {
      // Reject karne par reason pucho
      feedback = window.prompt("Reason for rejection? (Brand will see this alert):", "Invalid image or details.");
      if (feedback === null) return; // Agar admin cancel kar de
    } else {
      if (!window.confirm(`Are you sure you want to approve this campaign?`)) return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/admin/campaigns/${id}/status`, 
        { status, feedback }, // Feedback (reason) backend ko bhej rahe hain
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPendingCampaigns(prev => prev.filter(c => c._id !== id));
      alert(`Campaign ${status.toUpperCase()} successfully!`);
    } catch (err) { 
      alert("Action failed: " + (err.response?.data?.message || "Error")); 
    }
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
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-8 gap-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
            Vistafluence <span className="text-fuchsia-600 not-italic">Admin</span>
          </h1>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-800 rounded-full border border-slate-700 text-xs font-bold text-slate-400">
              SERVER: <span className="text-green-500 underline">ONLINE</span>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Users", val: stats.users, icon: <FaUsers/>, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { label: "Payments", val: stats.payments, icon: <FaCreditCard/>, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "New Signups", val: stats.newSignups, icon: <FaChartLine/>, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Revenue", val: `$${stats.revenue}`, icon: <FaDollarSign/>, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" }
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center text-xl mb-4`}>{item.icon}</div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{item.label}</p>
              <p className="text-3xl font-black mt-1 text-white">{item.val}</p>
            </div>
          ))}
        </div>

        {/* --- PENDING CAMPAIGNS --- */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black flex items-center gap-4 text-white uppercase tracking-tight">
            <FaBullhorn className="text-fuchsia-600" /> Pending Approvals
          </h2>
          {pendingCampaigns.length === 0 ? (
            <div className="bg-slate-900/30 p-20 rounded-[3rem] border-2 border-dashed border-slate-800 text-center">
              <p className="text-slate-600 font-bold text-xl uppercase tracking-widest">No Campaigns Awaiting Review</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10">
              {pendingCampaigns.map((camp) => (
                <div key={camp._id} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden hover:border-slate-700 transition-all">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/2 h-[400px] lg:h-auto relative group overflow-hidden">
                      <img 
                        src={getImageUrl(camp.imagePath)} 
                        alt="Campaign Verification" 
                        className="w-full h-full object-contain bg-black transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Verification+Image+Missing"; }}
                      />
                      <div className="absolute top-4 left-4 bg-fuchsia-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest">
                        Verify This Image
                      </div>
                    </div>
                    
                    <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-between space-y-8">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-3xl md:text-4xl font-black text-white leading-none uppercase italic">{camp.name}</h3>
                          <div className="text-right">
                             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Budget</p>
                             <p className="text-3xl font-black text-green-500">₹{camp.budget}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-6">
                           <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-white uppercase">{camp.createdBy?.businessName?.[0] || "I"}</div>
                           <p className="text-cyan-400 font-bold uppercase tracking-tighter text-sm">Brand: {camp.createdBy?.businessName || "Individual Client"}</p>
                        </div>
                        <p className="text-slate-400 text-lg leading-relaxed line-clamp-4 italic border-l-4 border-slate-700 pl-4">
                          "{camp.description}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <button onClick={() => handleCampaignStatus(camp._id, 'approved')} className="bg-green-600 hover:bg-green-500 text-white py-5 rounded-3xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-900/20 flex items-center justify-center gap-2">
                          <FaCheck size={20}/> Approve
                        </button>
                        <button onClick={() => handleCampaignStatus(camp._id, 'rejected')} className="bg-red-600 hover:bg-red-500 text-white py-5 rounded-3xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
                          <FaTimes size={20}/> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-10">
            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-cyan-400 uppercase tracking-tighter">
                <FaUserPlus/> Academy Deployment
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <input type="email" placeholder="Student Email" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-cyan-500 transition-all text-sm" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} />
                <input type="text" placeholder="Access Password" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-cyan-500 transition-all text-sm" value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} />
                <button disabled={creatingUser} className="w-full bg-cyan-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-500 transition-all text-xs">
                  {creatingUser ? "Processing..." : "Generate Access"}
                </button>
              </form>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
              <h3 className="text-xl font-black mb-8 text-fuchsia-500 uppercase tracking-tighter">Notification Blast</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Alert Title" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-fuchsia-500 transition-all text-sm" value={newNotification.title} onChange={e => setNewNotification({...newNotification, title: e.target.value})} />
                <textarea placeholder="Your message here..." className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none h-24 focus:border-fuchsia-500 transition-all text-sm" value={newNotification.message} onChange={e => setNewNotification({...newNotification, message: e.target.value})}></textarea>
                <label className="block w-full text-center py-4 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-800/50 transition-all">
                  <span className="text-slate-500 text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-widest">
                    <BiImageAdd size={24}/> {newNotification.imageFile ? newNotification.imageFile.name : "Attach Visual Asset"}
                  </span>
                  <input type="file" className="hidden" onChange={e => setNewNotification({...newNotification, imageFile: e.target.files[0]})} />
                </label>
                <button onClick={postNotification} className="w-full bg-fuchsia-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-fuchsia-600 transition-all text-xs shadow-lg shadow-fuchsia-900/20">Push To All</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-tight">Active Feed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notifications.map(n => (
                <div key={n._id} className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-white uppercase text-sm tracking-wide">{n.title}</h4>
                    <button onClick={() => deleteNotification(n._id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-colors"><MdDeleteForever size={20}/></button>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{n.message}</p>
                  {n.image && <img src={getImageUrl(n.image)} alt="notification" className="rounded-2xl w-full h-40 object-cover border border-slate-800" />}
                </div>
              ))}
            </div>

            <div className="space-y-6 pt-10">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-800 pb-4 flex items-center gap-2">
                  <FaEnvelope/> Recent Inquiries
                </h3>
                <div className="space-y-4">
                  {messages.slice(0, 3).map(m => (
                    <div key={m._id} className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 flex items-center justify-between group">
                      <div>
                        <p className="text-cyan-400 text-xs font-black uppercase mb-1 tracking-wider">{m.name}</p>
                        <p className="text-slate-300 text-sm font-medium italic">"{m.message}"</p>
                      </div>
                      <p className="text-[10px] font-black text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase">{m.email}</p>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;