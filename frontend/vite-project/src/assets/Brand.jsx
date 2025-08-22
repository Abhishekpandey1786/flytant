import React, { useState, useEffect } from "react";
import { TiContacts } from "react-icons/ti";
import { Link } from "react-router-dom";
import { FaUser, FaBullhorn, FaDollarSign, FaPowerOff, FaClipboardList, FaShoppingCart, FaHome, FaComments, FaBell, FaFileAlt, FaPlus, } from "react-icons/fa";
import img4 from "./image/c1.png";
import img5 from "./image/c2.png";
import img6 from "./image/c3.png";
import Profile from "./Profile"; // ✅ Profile component import
import Campaigns from "./Campaigns"; // ✅ Campaigns component import

const Brand = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState("Brand");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activePage, setActivePage] = useState("home"); // ✅ New state to track the active page
  const sliderImages = [img4, img5, img6];

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

  // ✅ New function to handle clicks on menu items
  const handleMenuItemClick = (key) => {
    setActivePage(key); // Update the active page
    setDropdownOpen(false); // Close the dropdown
  };

  const menuItems =
    role === "Brand"
      ? [
          { name: "Social Profile", key: "profile", icon: <FaUser /> },
          { name: "My Campaigns", key: "Campaigns", icon: <FaBullhorn /> },
          { name: "Subscription", key: "subscription", icon: <FaDollarSign /> },
          { name: "Logout", key: "logout", icon: <FaPowerOff />, danger: true },
        ]
      : [
          { name: "Social Profile", key: "profile", icon: <FaUser /> },
          { name: "Applied Campaigns", key: "applied-campaigns", icon: <FaClipboardList /> },
          { name: "My Orders", key: "my-orders", icon: <FaShoppingCart /> },
          { name: "Subscription", key: "subscription", icon: <FaDollarSign /> },
          { name: "Logout", key: "logout", icon: <FaPowerOff />, danger: true },
        ];
  
  return (
    <div className="flex min-h-screen bg-slate-900 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 rounded-r-2xl flex flex-col p-6 shadow-lg">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-10">
          <span className="text-2xl font-bold text-white">Flytant</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 w-full">
          <ul className="space-y-3">
            {[
              { name: "Home", key: "home", icon: <FaHome /> },
              { name: "Campaigns", key: "Campaigns", icon: <FaBullhorn /> },
              { name: "Chats", key: "chats", icon: <FaComments /> },
              { name: "Notifications", key: "notifications", icon: <FaBell /> },
              { name: "News", key: "news", icon: <FaFileAlt /> },
            ].map((item, index) => (
              <li
                key={item.key} // ✅ Use item.key for unique key
                onClick={() => handleMenuItemClick(item.key)} // ✅ Pass key to handler
                className={`flex items-center space-x-3 py-2 px-4 rounded-lg cursor-pointer transition ${
                  activePage === item.key
                    ? "bg-fuchsia-800 neno-button shadow-xl hover:shadow-fuchsia-800/50 hover:bg-fuchsia-800 border-fuchsia-800 transition text-white"
                    : "hover:bg-fuchsia-700 neno-button shadow-xl hover:shadow-fuchsia-800/50 text-gray-300 border-fuchsia-800 transition text-white-300"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </nav>

        {/* Create Button */}
        <div className="mt-8">
          <button className="w-full py-3 text-white font-semibold rounded-full flex items-center justify-center space-x-2 bg-fuchsia-800 hover:bg-fuchsia-700 transition neno-button shadow-xl hover:shadow-fuchsia-800/50 border-fuchsia-800 ">
            <FaPlus className="w-5 h-5" />
            <span>Create Campaign</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-end items-center px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <a href="mailto:yourmail@example.com">
            <button className="px-4 py-2 rounded-full font-medium bg-fuchsia-800 hover:bg-fuchsia-700 neno-button shadow-x1 hover:shadow-fuchsia-800/50 ">
              Contact
            </button>
          </a>

          {/* Profile Dropdown */}
          <div className="ml-4 relative">
            <div
              className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center cursor-pointer border hover:bg-fuchsia-800 transition neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white border-fuchsia-800 "
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <TiContacts className="text-xl" />
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-xl shadow-lg p-4 space-y-3 neno-button shadow-x1 hover:shadow-fuchsia-800/50">
                <p className="text-sm text-white">I'm a</p>

                {/* Role Toggle */}
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

                {/* Menu Items */}
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <div
                      key={item.key} // ✅ Use item.key for unique key
                      onClick={() => handleMenuItemClick(item.key)} // ✅ Pass key to handler
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition ${
                        item.danger
                          ? "hover:text-red-500 text-red-400"
                          : activePage === item.key // ✅ Conditionally apply styling
                          ? "bg-fuchsia-800 text-white"
                          : "hover:bg-fuchsia-700 text-gray-200 neno-button shadow-x1 hover:shadow-fuchsia-800/50"
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

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {activePage === "home" && (
            <>
              {/* Hero Section (Image Slider) */}
              <div className="w-full h-96 rounded-xl overflow-hidden relative flex items-center">
                {/* Slider Images */}
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
                {/* Overlay and content */}
                <div className="absolute inset-0 bg-gradient-to-r flex items-center p-12">
                  <div className="flex-1 flex justify-end items-center">
                    <img
                      src="https://images.unsplash.com/photo-1524503033411-c958864380a9?q=80&w=1287&auto=format&fit=crop"
                      alt="Influencer"
                      className="w-auto h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-100">
                  Trending Influencers
                </h2>
                <div className="mt-4 p-8 bg-slate-800 rounded-lg text-center text-gray-400">
                  🚀 Content for trending influencers goes here.
                </div>
              </div>
            </>
          )}

          {activePage === "profile" && <Profile />}
          {activePage === "Campaigns" && <Campaigns />}
        </div>
      </main>
    </div>
  );
};

export default Brand;