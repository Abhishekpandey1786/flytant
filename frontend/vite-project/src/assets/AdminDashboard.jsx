import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaCreditCard,
  FaChartLine,
  FaRupeeSign,
  FaUserPlus,
  FaBullhorn,
  FaCheck,
  FaTimes,
  FaEnvelope,
} from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { BiImageAdd } from "react-icons/bi";

/**
 * Design notes
 * ------------
 * Ink/amber "ops console" palette instead of the neon fuchsia/cyan card-kit
 * look — the job here is fast triage (approve/reject a queue), so the layout
 * leads with a numbered queue instead of a grid of identical stat cards.
 *
 *   --ink        #12141C   page background
 *   --surface    #1A1D27   panels
 *   --raised     #20232F   ticker / inputs
 *   --line       #2B2F3B   hairlines
 *   --text       #EDEEF3   primary text
 *   --muted      #8A93A8   secondary text
 *   --signal     #FF9F45   pending / needs action
 *   --confirm    #3DDC97   approved / positive
 *   --reject     #FF6B6B   rejected / negative
 *
 * Headline type: Barlow Condensed (tight, wire-service feel).
 * Body type: Inter.
 */

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
  const [sendingNotification, setSendingNotification] = useState(false);

  const fileInputRef = useRef(null);

  const token = localStorage.getItem("adminToken");
  const API_BASE_URL = "https://vistafluence.onrender.com/api";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `https://vistafluence.onrender.com${imagePath}`;
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value || 0);

  const formatDate = (value) =>
    value
      ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
          new Date(value)
        )
      : "—";

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/stats`, authHeaders);
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch error");
    }
  };

  const fetchPendingCampaigns = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/campaigns/pending`, authHeaders);
      setPendingCampaigns(res.data);
    } catch (err) {
      console.error("Campaigns fetch error");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/notifications`, authHeaders);
      setNotifications(res.data);
    } catch (err) {
      console.error("Notifications fetch error");
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/contact/all`, authHeaders);
      setMessages(res.data);
    } catch (err) {
      console.error("Messages fetch error");
    }
  };

  const handleCampaignStatus = async (id, status) => {
    let feedback = "";

    if (status === "rejected") {
      feedback = window.prompt("Reason for rejection? The brand will see this:", "Invalid image or details.");
      if (feedback === null) return; // admin cancelled
    } else if (!window.confirm("Approve this campaign?")) {
      return;
    }

    try {
      await axios.patch(
        `${API_BASE_URL}/admin/campaigns/${id}/status`,
        { status, feedback },
        authHeaders
      );
      setPendingCampaigns((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || "Error"));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await axios.post(`${API_BASE_URL}/academy/create-user`, userData, authHeaders);
      alert("User created and credentials mailed.");
      setUserData({ email: "", password: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
    setCreatingUser(false);
  };

  const postNotification = async () => {
    if (!newNotification.title && !newNotification.message && !newNotification.imageFile) {
      alert("Add a title, message, or image before sending.");
      return;
    }

    const formData = new FormData();
    formData.append("title", newNotification.title);
    formData.append("message", newNotification.message);
    formData.append("link", newNotification.link);
    if (newNotification.imageFile) formData.append("image", newNotification.imageFile);

    setSendingNotification(true);
    try {
      await axios.post(`${API_BASE_URL}/admin/notifications`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setNewNotification({ title: "", message: "", link: "", imageFile: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchNotifications();
    } catch (err) {
      alert("Failed to send notification");
    }
    setSendingNotification(false);
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/notifications/${id}`, authHeaders);
      fetchNotifications();
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchStats();
    fetchNotifications();
    fetchMessages();
    fetchPendingCampaigns();

    const interval = setInterval(() => {
      fetchStats();
      fetchPendingCampaigns();
      fetchNotifications();
      fetchMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const tickerStats = [
    { label: "Total users", val: stats.users, icon: <FaUsers /> },
    { label: "Payments", val: stats.payments, icon: <FaCreditCard /> },
    { label: "New signups, 7d", val: stats.newSignups, icon: <FaChartLine /> },
    { label: "Revenue", val: `₹${formatCurrency(stats.revenue)}`, icon: <FaRupeeSign /> },
  ];

  return (
    <div
      className="min-h-screen bg-[#12141C] text-[#EDEEF3]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        .headline { font-family: 'Barlow Condensed', system-ui, sans-serif; }
      `}</style>

      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between py-6 border-b border-[#2B2F3B]">
          <div>
            <h1 className="headline text-3xl md:text-[2.15rem] font-bold leading-none tracking-tight">
              Vistafluence <span className="text-[#8A93A8] font-medium">Admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8A93A8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3DDC97] inline-block" />
            Server online
          </div>
        </div>

        {/* TICKER */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#2B2F3B] border-b border-[#2B2F3B] bg-[#1A1D27]">
          {tickerStats.map((item, i) => (
            <div key={i} className="px-5 py-5 md:py-6">
              <div className="flex items-center gap-2 text-[#8A93A8] text-xs mb-2">
                <span className="text-sm opacity-70">{item.icon}</span>
                {item.label}
              </div>
              <p className="headline text-3xl font-bold tabular-nums">{item.val}</p>
            </div>
          ))}
        </div>

        {/* PENDING QUEUE */}
        <div className="py-10">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="headline text-2xl font-bold flex items-center gap-3">
              <FaBullhorn className="text-[#FF9F45]" size={18} />
              Pending approvals
            </h2>
            <span className="text-sm text-[#8A93A8]">
              {pendingCampaigns.length} {pendingCampaigns.length === 1 ? "campaign" : "campaigns"}
            </span>
          </div>

          {pendingCampaigns.length === 0 ? (
            <div className="border border-dashed border-[#2B2F3B] rounded-lg py-16 text-center">
              <p className="text-[#8A93A8]">Queue is empty — nothing waiting on review.</p>
            </div>
          ) : (
            <div className="border-t border-[#2B2F3B]">
              {pendingCampaigns.map((camp, idx) => (
                <div
                  key={camp._id}
                  className="border-b border-[#2B2F3B] py-6 flex flex-col md:flex-row gap-6"
                >
                  <span className="headline text-[#8A93A8] text-2xl font-bold w-8 shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div className="w-full md:w-40 h-32 shrink-0 rounded-md overflow-hidden bg-black border border-[#2B2F3B]">
                    <img
                      src={getImageUrl(camp.imagePath)}
                      alt={`Verification for ${camp.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="headline text-xl font-bold truncate">{camp.name}</h3>
                      <p className="headline text-xl font-bold text-[#3DDC97] shrink-0">
                        ₹{formatCurrency(camp.budget)}
                      </p>
                    </div>
                    <p className="text-sm text-[#8A93A8] mb-2">
                      {camp.createdBy?.businessName || camp.createdBy?.name || "Individual client"}
                    </p>
                    <p className="text-sm text-[#B8BECC] line-clamp-2 leading-relaxed mb-3">
                      {camp.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#8A93A8]">
                      {camp.platforms?.length > 0 && (
                        <span>
                          <span className="text-[#5C6478]">Platforms:</span>{" "}
                          {camp.platforms.join(", ")}
                        </span>
                      )}
                      {camp.requiredNiche?.length > 0 && (
                        <span>
                          <span className="text-[#5C6478]">Niche:</span>{" "}
                          {camp.requiredNiche.join(", ")}
                        </span>
                      )}
                      <span>
                        <span className="text-[#5C6478]">Ends:</span> {formatDate(camp.endDate)}
                      </span>
                      {camp.applicants?.length > 0 && (
                        <span>
                          <span className="text-[#5C6478]">Applicants:</span>{" "}
                          {camp.applicants.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0 md:w-36">
                    <button
                      onClick={() => handleCampaignStatus(camp._id, "approved")}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#3DDC97] text-[#12141C] font-semibold text-sm py-2.5 rounded-md hover:brightness-110 transition-all"
                    >
                      <FaCheck size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleCampaignStatus(camp._id, "rejected")}
                      className="flex-1 flex items-center justify-center gap-2 border border-[#FF6B6B] text-[#FF6B6B] font-semibold text-sm py-2.5 rounded-md hover:bg-[#FF6B6B]/10 transition-all"
                    >
                      <FaTimes size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LOWER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          {/* LEFT: forms */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[#1A1D27] border border-[#2B2F3B] rounded-lg p-6">
              <h3 className="headline text-lg font-bold flex items-center gap-2 mb-5">
                <FaUserPlus className="text-[#8A93A8]" size={16} /> Academy access
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <input
                  type="email"
                  placeholder="Student email"
                  required
                  className="w-full bg-[#20232F] border border-[#2B2F3B] px-4 py-3 rounded-md text-sm outline-none focus:border-[#FF9F45] transition-colors"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Access password"
                  required
                  className="w-full bg-[#20232F] border border-[#2B2F3B] px-4 py-3 rounded-md text-sm outline-none focus:border-[#FF9F45] transition-colors"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                />
                <button
                  disabled={creatingUser}
                  className="w-full bg-[#EDEEF3] text-[#12141C] font-semibold py-3 rounded-md text-sm hover:brightness-90 transition-all disabled:opacity-50"
                >
                  {creatingUser ? "Creating…" : "Create and email access"}
                </button>
              </form>
            </div>

            <div className="bg-[#1A1D27] border border-[#2B2F3B] rounded-lg p-6">
              <h3 className="headline text-lg font-bold mb-5">Send notification</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full bg-[#20232F] border border-[#2B2F3B] px-4 py-3 rounded-md text-sm outline-none focus:border-[#FF9F45] transition-colors"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                />
                <textarea
                  placeholder="Message"
                  className="w-full bg-[#20232F] border border-[#2B2F3B] px-4 py-3 rounded-md text-sm h-24 outline-none focus:border-[#FF9F45] transition-colors resize-none"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                />
                <label className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-[#2B2F3B] rounded-md cursor-pointer text-sm text-[#8A93A8] hover:border-[#FF9F45] hover:text-[#EDEEF3] transition-colors">
                  <BiImageAdd size={18} />
                  {newNotification.imageFile ? newNotification.imageFile.name : "Attach image (optional)"}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setNewNotification({ ...newNotification, imageFile: e.target.files[0] })
                    }
                  />
                </label>
                <button
                  onClick={postNotification}
                  disabled={sendingNotification}
                  className="w-full bg-[#FF9F45] text-[#12141C] font-semibold py-3 rounded-md text-sm hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {sendingNotification ? "Sending…" : "Send to all users"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: feed + inquiries */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h3 className="headline text-lg font-bold mb-4">Active notifications</h3>
              {notifications.length === 0 ? (
                <p className="text-sm text-[#8A93A8]">Nothing sent yet.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className="flex gap-4 bg-[#1A1D27] border border-[#2B2F3B] rounded-lg p-4"
                    >
                      {n.image && (
                        <img
                          src={getImageUrl(n.image)}
                          alt=""
                          className="w-16 h-16 rounded-md object-cover border border-[#2B2F3B] shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-semibold text-sm truncate">{n.title}</h4>
                          <button
                            onClick={() => deleteNotification(n._id)}
                            className="text-[#8A93A8] hover:text-[#FF6B6B] transition-colors shrink-0"
                            aria-label="Delete notification"
                          >
                            <MdDeleteForever size={18} />
                          </button>
                        </div>
                        <p className="text-sm text-[#8A93A8] mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="headline text-lg font-bold flex items-center gap-2 mb-4">
                <FaEnvelope className="text-[#8A93A8]" size={15} /> Recent inquiries
              </h3>
              {messages.length === 0 ? (
                <p className="text-sm text-[#8A93A8]">No messages yet.</p>
              ) : (
                <div className="space-y-2">
                  {messages.slice(0, 5).map((m) => (
                    <div
                      key={m._id}
                      className="flex items-center justify-between gap-4 border-b border-[#2B2F3B] py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-sm text-[#8A93A8] truncate">{m.message}</p>
                      </div>
                      <p className="text-xs text-[#8A93A8] shrink-0">{m.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;