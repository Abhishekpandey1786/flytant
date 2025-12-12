// src/components/Footer.jsx

import React from "react";
import { Link } from "react-router-dom";
import { FaEnvelope,} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 py-10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">

        {/* Logo + Tagline + Socials */}
        <div>
          <h2 className="text-2xl font-bold text-white">vistafluence.com</h2>
          <p className="mt-2 text-sm text-gray-400">Create. Connect. Conquer.</p>
          <div className="flex space-x-4 mt-4 text-gray-400">
            <a href="mailto:info@vistafluence.com" className="hover:text-white"><FaEnvelope size={20} /></a>
          </div>
        </div>

        {/* Links for Brands */}
        <div>
          <h4 className="font-semibold text-white mb-2">For Brands</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/campaigns" className="hover:text-white transition">Explore Campaigns</Link></li>
            <li><Link to="/create-campaign" className="hover:text-white transition">Create Campaign</Link></li>
            <li><Link to="/" className="hover:text-white transition">Pricing Plans</Link></li>
            <li><Link to="/dashboard/brand" className="hover:text-white transition">Brand Showcase</Link></li>
          </ul>
        </div>

        {/* Links for Influencers */}
        <div>
          <h4 className="font-semibold text-white mb-2">For Influencers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/dashboard" className="hover:text-white transition">My Dashboard</Link></li>
            <li><Link to="/dashboard/influencer" className="hover:text-white transition">Find Influencer</Link></li>
            <li><Link to="/" className="hover:text-white transition">Influencer Tools</Link></li>
            <li><Link to="/" className="hover:text-white transition">How it Works</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="font-semibold text-white mb-2">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            <li><Link to="/blogs" className="hover:text-white transition">Blog</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link to="/Refund-Policy" className="hover:text-white transition">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="text-center text-gray-500 text-xs mt-10 border-t border-gray-700 pt-4">
        © 2025 vistafluence.com. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;