// src/components/Footer.jsx
import React from "react";
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaEnvelope,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">

        {/* Logo + tagline */}
        <div>
          <h2 className="text-2xl font-bold text-white">Flytant</h2>
          <p className="mt-2">Connecting Brands & Influencers</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-white"><FaInstagram size={20} /></a>
            <a href="#" className="hover:text-white"><FaFacebookF size={20} /></a>
            <a href="#" className="hover:text-white"><FaTwitter size={20} /></a>
            <a href="#" className="hover:text-white"><FaEnvelope size={20} /></a>
            <a href="#" className="hover:text-white"><FaYoutube size={20} /></a>
            <a href="#" className="hover:text-white"><FaLinkedinIn size={20} /></a>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <a href="#" className="hover:text-white">Home</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">About</a>
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Career</a>
          <a href="#" className="hover:text-white">Contact</a>
          <a href="#" className="hover:text-white">Ads</a>
          <a href="#" className="hover:text-white">FAQs</a>
          <a href="#" className="hover:text-white">Blogs</a>
        </div>

        {/* App store buttons */}
        <div>
          <p className="mb-3">Get the apps!</p>
          <div className="flex space-x-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Play Store"
              className="h-10"
            />
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="App Store"
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-700 pt-4">
        © Flytant 2025
      </div>
    </footer>
  );
}

export default Footer;
