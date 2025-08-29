import React, { useState, useContext } from "react";
import img3 from "./image/s1.png";
import { TiContacts } from "react-icons/ti";
import { Link, useNavigate } from "react-router-dom";
import Profile from "./Profile";
import Campaigns from "./Campaigns";

import {
  FaUser,
  FaBullhorn,
  FaDollarSign,
  FaPowerOff,
  FaClipboardList,
  FaShoppingCart,
} from "react-icons/fa";
import { AuthContext } from "./AuthContext"; // ✅ AuthContext import
import Chats from "./Chats";

const Dashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState("Influencer");
  const [activePage, setActivePage] = useState("feed");
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const menuItems =
    role === "Brand"
      ? [
          { name: "Social Profile", icon: <FaUser />, key: "profile" },
          { name: "Campaigns", icon: <FaBullhorn />, key: "campaigns" },
          { name: "Subscription", icon: <FaDollarSign />, key: "subscription" },
          { name: "Logout", icon: <FaPowerOff />, key: "logout", danger: true },
        ]
      : [
          { name: "Social Profile", icon: <FaUser />, key: "profile" },
          {
            name: "Campaigns",
            icon: <FaClipboardList />,
            key: "campaigns",
          },
          { name: "My Orders", icon: <FaShoppingCart />, key: "orders" },
          { name: "Subscription", icon: <FaDollarSign />, key: "subscription" },
          { name: "Logout", icon: <FaPowerOff />, key: "logout", danger: true },
        ];

  const handleMenuItemClick = (key) => {
    if (key === "logout") {
      logout();
      navigate("/login");
      setDropdownOpen(false);
      return;
    }

    setActivePage(key);
    setDropdownOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-gray-100 font-sans">
      <aside className="w-64 bg-slate-800 rounded-r-2xl flex flex-col p-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-10">
          <span className="text-2xl font-bold text-white ">Abhifly</span>
        </div>
        <nav className="flex-1 w-full">
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
              { name: "Sponsorships", icon: "⚙️", key: "sponsorships" },
              { name: "Chats", icon: "💬", key: "Chats" },
              { name: "Notifications", icon: "🔔", key: "notifications" },
              { name: "Subscription", icon: "💳", key: "subscription" },
              { name: "More", icon: "⋯", key: "more" },
            ].map((item) => (
              <li
                key={item.key}
                onClick={() => setActivePage(item.key)}
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
      <Link to="/create-campaign"><button className="w-full py-3 bg-fuchsia-800 text-white font-semibold rounded-full flex items-center justify-center space-x-2 neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 hover:bg-fuchsia-800 border-fuchsia-800 transition">
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
            <span>Create </span>
          </button></Link>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="flex justify-end items-center px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
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
        </header>
        <div className="flex-1 p-6">
          {activePage === "feed" && (
            <p className="text-gray-500 text-xl font-medium">No post found</p>
          )}
          {activePage === "profile" && <Profile />}
          {activePage === "campaigns" && <Campaigns />}
          {activePage=== "Chats" && <Chats/>}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
