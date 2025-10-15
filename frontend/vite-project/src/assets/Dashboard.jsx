// src/components/Dashboard.js
import React, { useState, useContext, useEffect } from "react";
import img3 from "./image/s1.png";
import { TiContacts } from "react-icons/ti";
import { Link, useNavigate } from "react-router-dom";
import Profile from "./Profile";
import Subscription from "./Subscription";
import InfluencersList from "./InfluencersList";
import Chats from "./Chats";
import {
  FaUser,
  FaBullhorn,
  FaDollarSign,
  FaPowerOff,
  FaClipboardList,
  FaShoppingCart,
  FaArrowRight,
} from "react-icons/fa";
import { AuthContext } from "./AuthContext";
import AppliedCampaigns from "./AppliedCampaigns";
import Campaigns from "./Campaigns";
import UserNotifications from "./UserNotifications";
import MyOrders from "./MyOrders";

const Dashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState("Influencer");
  const [activePage, setActivePage] = useState("feed");
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ For mobile sidebar
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.userType) {
      if (user.userType === "influencer") {
        setRole("Influencer");
      } else if (user.userType === "advertiser") {
        setRole("Brand");
      }
    }
  }, [user]);

  const menuItems =
    role === "Brand"
      ? [
          { name: "Social Profile", icon: <FaUser />, key: "profile" },
          {
            name: "My Campaigns",
            icon: <FaBullhorn />,
            key: "applied-campaigns",
          },
          { name: "Subscription", icon: <FaDollarSign />, key: "subscription" },
          { name: "Logout", icon: <FaPowerOff />, key: "logout", danger: true },
        ]
      : [
          { name: "Social Profile", icon: <FaUser />, key: "profile" },
          {
            name: "My Campaigns",
            icon: <FaClipboardList />,
            key: "applied-campaigns",
          },
          { name: "My Orders", icon: <FaShoppingCart />, key: "orders" },
          { name: "Subscription", icon: <FaDollarSign />, key: "subscription" },
          { name: "Logout", icon: <FaPowerOff />, key: "logout", danger: true },
        ];

  const handleMenuItemClick = (key) => {
    if (key === "logout") {
      logout();
      navigate("/");
      setDropdownOpen(false);
      return;
    }

    setActivePage(key);
    setDropdownOpen(false);
    setSidebarOpen(false); // ✅ Close sidebar on mobile after selecting
  };
  // ✅ New DashboardHome component with the welcome banner
  const DashboardHome = () => (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Dynamic Welcome Banner */}
      <div
        className="bg-slate-800
                  p-6 sm:p-8 md:p-10 
                  rounded-2xl 
                  flex flex-col lg:flex-row 
                  items-center lg:items-start justify-between 
                   animate-fade-in gap-6 lg:gap-0 neno-button shadow-xl border-fuchsia-800 text-white"
      >
        {/* Left Text */}
        <div className="text-center lg:text-left flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 leading-snug">
            Welcome back,{" "}
            <span className="text-fuchsia-700">{user?.name || role}</span>!
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto lg:mx-0">
            Your hub for all things influence. Discover new opportunities,
            manage your collaborations, and track your success.
          </p>
        </div>
        <Link
          to={role === "Brand" ? "/create-campaign" : "/campaigns"}
          className="shrink-0"
        >
          <button
            className="px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 
                         bg-white text-fuchsia-800 font-bold 
                         rounded-full text-sm sm:text-base md:text-lg 
                         hover:bg-gray-100 
                         transform hover:scale-105 transition-all duration-300 
                         flex items-center space-x-2 group neno-button shadow-xl border-fuchsia-800 "
          >
            <span>
              {role === "Brand"
                ? "Launch New Campaign"
                : "Explore Opportunities"}
            </span>
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-900 text-gray-100 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-slate-800 rounded-r-2xl flex flex-col p-6 shadow-lg z-50 transform transition-transform duration-300
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-bold text-white">vistafluence.com </span>
          {/* Close button for mobile */}
          <button
            className="md:hidden text-white text-xl"
            onClick={() => setSidebarOpen(false)}
          >
            ✖
          </button>
        </div>
        <nav className="flex-1 w-full overflow-y-auto">
          <ul className="space-y-3">
            <li
              onClick={() => setActivePage("feed")}
              className={`flex items-center space-x-3 py-2 px-4 rounded-lg cursor-pointer ${
                activePage === "feed"
                  ? "bg-fuchsia-800 text-white neno-button shadow-xl hover:shadow-fuchsia-800/50 border-fuchsia-800 transition"
                  : "hover:bg-fuchsia-700 text-gray-300"
              }`}
            >
              <img src={img3} alt="Feed Icon" className="w-6 h-6" />
              <span>Feed</span>
            </li>
            {[
              { name: "Sponsorships", icon: "⚙️", key: "campaigns" },
              { name: "Chats", icon: "💬", key: "Chats" },
              { name: "Notifications", icon: "🔔", key: "notifications" },
              { name: "Subscription", icon: "💳", key: "subscription" },
            ].map((item) => (
              <li
                key={item.key}
                onClick={() => handleMenuItemClick(item.key)}
                className={`flex items-center space-x-3 py-2 px-4 rounded-lg cursor-pointer ${
                  activePage === item.key
                    ? "bg-fuchsia-800 text-white"
                    : "neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white hover:bg-fuchsia-800 border-fuchsia-800 transition"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-8">
          <Link to="/create-campaign">
            <button className="w-full py-3 bg-fuchsia-800 text-white font-semibold rounded-full flex items-center justify-center space-x-2 neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2  border-fuchsia-800 transition">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Create Campaign</span>
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="flex justify-between md:justify-end items-center px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          {/* Sidebar toggle button on mobile */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex items-center">
            <a href="mailto:yourmail@example.com">
              <button className="px-4 py-2 bg-fuchsia-800 rounded-full font-medium neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 transition">
                Contact
              </button>
            </a>
            <div className="ml-4 relative">
              <div
                className="w-10 h-10 bg-fuchsia-800 rounded-full flex items-center justify-center cursor-pointer neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 transition"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <TiContacts />
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-xl shadow-lg p-4 space-y-3 neno-button shadow-x1 hover:shadow-fuchsia-800/50">
                  <p className="text-sm text-white">I'm a</p>
                  <div className="flex rounded-full border border-gray-600 overflow-hidden">
                    <Link to="/dashboard/brand" className="flex-1">
                      <button
                        className={`w-full py-2 text-sm font-medium transition ${
                          role === "Brand"
                            ? "bg-white text-black"
                            : "bg-transparent text-white"
                        }`}
                        onClick={() => {
                          setRole("Brand");
                          setDropdownOpen(false);
                        }}
                      >
                        Brand
                      </button>
                    </Link>
                    <Link to="/dashboard" className="flex-1">
                      <button
                        className={`w-full py-2 text-sm font-medium transition ${
                          role === "Influencer"
                            ? "bg-white text-black"
                            : "bg-transparent text-white"
                        }`}
                        onClick={() => {
                          setRole("Influencer");
                          setDropdownOpen(false);
                        }}
                      >
                        Influencer
                      </button>
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {menuItems.map((item) => (
                      <div
                        key={item.key}
                        onClick={() => handleMenuItemClick(item.key)}
                        className={`flex items-center space-x-2 cursor-pointer p-2 rounded-md transition ${
                          item.danger
                            ? "hover:text-red-500 text-red-400"
                            : activePage === item.key
                            ? "bg-fuchsia-800 text-white"
                            : "neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white hover:bg-fuchsia-800 border-fuchsia-800 transition"
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 p-6">
          {activePage === "feed" && <DashboardHome />}
          {activePage === "feed" && <InfluencersList />}
          {activePage === "profile" && <Profile />}
          {activePage === "applied-campaigns" && <AppliedCampaigns />}
          {activePage === "Chats" && <Chats />}
          {activePage === "subscription" && <Subscription />}
          {activePage === "campaigns" && <Campaigns />}
          {activePage === "notifications" && <UserNotifications />}
          {activePage === "orders" && <MyOrders />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
