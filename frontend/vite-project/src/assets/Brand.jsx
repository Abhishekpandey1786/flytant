import React, { useState, useEffect, useContext } from "react";
import { TiContacts } from "react-icons/ti";
import { Link, useNavigate } from "react-router-dom";
import News from "./News";
import {
  FaUser,
  FaBullhorn,
  FaDollarSign,
  FaPowerOff,
  FaClipboardList,
  FaShoppingCart,
  FaHome,
  FaComments,
  FaBell,
  FaFileAlt,
  FaPlus,
  FaBuilding,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import img4 from "./image/d1.png";
import img5 from "./image/d2.png";
import img6 from "./image/d3.png";
import Profile from "./Profile";
import Campaigns from "./Campaigns";
import { AuthContext } from "./AuthContext";
import Chats from "./Chats";
import Subscription from "./Subscription";
import BrandList from "./BrandList";
import UserNotifications from "./UserNotifications";

import p1 from "./image/p1.png";
import p2 from "./image/p2.png";
import p3 from "./image/p3.png";
import p4 from "./image/p4.png";
import p5 from "./image/p5.png";
import p6 from "./image/p6.png";
import p7 from "./image/p7.png";
import p8 from "./image/p8.png";

const Brand = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState("Brand");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activePage, setActivePage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sliderImages = [img4, img5, img6];
  const influencers = [p1, p2, p3, p4, p5, p6, p7, p8]; // ✅ FIX ADDED HERE

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setDropdownOpen(false);
  };

  const handleMenuItemClick = (key) => {
    if (key === "logout") {
      logout();
      navigate("/");
      setDropdownOpen(false);
      return;
    }
    setActivePage(key);
    setDropdownOpen(false);
    setSidebarOpen(false);
  };

  const handleCreateCampaignClick = () => {
    navigate("/create-campaign");
  };

  const menuItems =
    role === "Brand"
      ? [
          { name: "Social Profile", key: "profile", icon: <FaUser /> },
          { name: " Campaigns", key: "Campaigns", icon: <FaBullhorn /> },
          { name: "Subscription", key: "subscription", icon: <FaDollarSign /> },
          { name: "Logout", key: "logout", icon: <FaPowerOff />, danger: true },
        ]
      : [
          { name: "Social Profile", key: "profile", icon: <FaUser /> },
          {
            name: "Campaigns",
            key: "applied-campaigns",
            icon: <FaClipboardList />,
          },
          { name: "My Orders", key: "my-orders", icon: <FaShoppingCart /> },
          { name: "Subscription", key: "subscription", icon: <FaDollarSign /> },
          { name: "Logout", key: "logout", icon: <FaPowerOff />, danger: true },
        ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-white font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-svh w-64 bg-slate-800 rounded-r-2xl flex flex-col p-6 shadow-lg transform transition-transform duration-300 z-20 
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div className="flex items-center justify-between mb-10">
          <span className="text-2xl font-bold text-white">Flytant</span>
          <button
            className="md:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="flex-1 w-full">
          <ul className="space-y-3">
            {[
              { name: "Home", key: "home", icon: <FaHome /> },
              { name: "Campaigns", key: "Campaigns", icon: <FaBullhorn /> },
              { name: "Brands", key: "brands", icon: <FaBuilding /> },
              { name: "Chats", key: "Chats", icon: <FaComments /> },
              { name: "Notifications", key: "notifications", icon: <FaBell /> },
              { name: "News", key: "News", icon: <FaFileAlt /> },
            ].map((item) => (
              <li
                key={item.key}
                onClick={() => handleMenuItemClick(item.key)}
                className={`flex items-center space-x-3 py-2 px-4 rounded-lg cursor-pointer transition ${
                  activePage === item.key
                    ? "bg-fuchsia-800 neno-button shadow-xl border-fuchsia-800 text-white"
                    : "hover:bg-fuchsia-700 neno-button shadow-xl text-gray-300 border-fuchsia-800"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8">
          <button
            onClick={handleCreateCampaignClick}
            className="w-full py-3 text-white font-semibold rounded-full flex items-center justify-center space-x-2 bg-fuchsia-800 transition neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800"
          >
            <FaPlus className="w-5 h-5" />
            <span>Create Campaign</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between md:justify-end items-center px-4 md:px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <button
            className="md:hidden text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars size={20} />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <a href="mailto:yourmail@example.com">
              <button className="px-4 py-2 rounded-full font-medium bg-fuchsia-800 hover:bg-fuchsia-700 neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white border-2 border-fuchsia-800 transition">
                Contact
              </button>
            </a>

            {/* Profile dropdown */}
            <div className="relative">
              <div
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center cursor-pointer border hover:bg-fuchsia-800 transition text-white border-fuchsia-800 neno-button shadow-xl hover:shadow-fuchsia-800/50"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <TiContacts className="text-xl" />
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-xl p-4 space-y-3 neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white border-2 border-fuchsia-800 transition">
                  <p className="text-sm text-white">I'm a</p>
                  <div className="flex rounded-full border border-gray-600 overflow-hidden">
                    <Link to="/dashboard/brand" className="flex-1">
                      <button
                        className={`w-full py-2 text-sm font-medium transition ${
                          role === "Brand"
                            ? "bg-white text-black"
                            : "bg-transparent text-white"
                        }`}
                        onClick={() => handleRoleChange("Brand")}
                      >
                        Brand
                      </button>
                    </Link>
                    <Link to="/dashboard/influencer" className="flex-1">
                      <button
                        className={`w-full py-2 text-sm font-medium transition ${
                          role === "Influencer"
                            ? "bg-white text-black"
                            : "bg-transparent text-white"
                        }`}
                        onClick={() => handleRoleChange("Influencer")}
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
                        className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition ${
                          item.danger
                            ? "hover:text-red-500 text-red-400"
                            : activePage === item.key
                            ? "bg-fuchsia-800 text-white"
                            : "hover:bg-fuchsia-700 text-gray-200 neno-button shadow-xl hover:shadow-fuchsia-800/50 border-fuchsia-800 transition"
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

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6">
          {activePage === "home" && (
            <>
              {/* Banner */}
              <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden relative flex items-center">
                {sliderImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Banner ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>

              {/* BrandList only under banner */}
              <div className="mt-8">
                <BrandList />
              </div>
            </>
          )}

          {activePage === "profile" && <Profile />}
          {activePage === "Campaigns" && <Campaigns />}
          {activePage === "brands" && <BrandList />}
          {activePage === "News" && <News />}
          {activePage === "Chats" && <Chats />}
          {activePage === "subscription" && <Subscription />}
          {activePage === "notifications" && <UserNotifications />}
        </div>

        {/* Influencers avatars */}
        <div className="mt-20 sm:mt-28 w-full text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 text-white drop-shadow-lg">
            100K+ Influencers And Brands already taking the advantages
          </h3>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
            {influencers.map((src, idx) => (
              <div
                key={idx}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full border-4 border-orange-400 overflow-hidden shadow-lg hover:scale-110 transition transform"
              >
                <img
                  src={src}
                  alt={`influencer-${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Brand;
