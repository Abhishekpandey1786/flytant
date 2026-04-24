// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 py-16 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Identity Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {/* CSS LOGO (Same as Navbar) */}
              <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                <div className="absolute w-5 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-tr-xl rounded-bl-sm transform skew-x-[-20deg] translate-x-1.5"></div>
                <div className="absolute w-5 h-7 bg-gradient-to-tr from-pink-500 to-magenta-600 rounded-tl-xl rounded-br-sm transform skew-x-[20deg] -translate-x-1.5"></div>
              </div>
              <Link to="/"><span className="text-xl font-black tracking-tighter text-white uppercase">
                Vistafluence
              </span></Link>
            </div>
            
            <p className="text-sm leading-relaxed max-w-xs">
              No Middlemen. Just Real Collaborations.</p>

            <div className="flex space-x-4">
              <a href="mailto:information@vistafluence.com" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all duration-300">
                <FaEnvelope size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all duration-300">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all duration-300">
                <FaTwitter size={18} />
              </a>
            </div>
          </div>

          {/* Links for Brands */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">For Brands</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/campaigns" className="hover:text-pink-500 hover:translate-x-1 inline-block transition-all">Explore Campaigns</Link></li>
              <li><Link to="/create-campaign" className="hover:text-pink-500 hover:translate-x-1 inline-block transition-all">Create Campaign</Link></li>
              <li><Link to="/" className="hover:text-pink-500 hover:translate-x-1 inline-block transition-all">Pricing Plans</Link></li>
              <li><Link to="/dashboard/brand" className="hover:text-pink-500 hover:translate-x-1 inline-block transition-all">Brand Showcase</Link></li>
            </ul>
          </div>

          {/* Links for Influencers */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">For Influencers</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/dashboard" className="hover:text-blue-500 hover:translate-x-1 inline-block transition-all">My Dashboard</Link></li>
              <li><Link to="/dashboard/influencer" className="hover:text-blue-500 hover:translate-x-1 inline-block transition-all">Find Influencer</Link></li>
              <li><Link to="/" className="hover:text-blue-500 hover:translate-x-1 inline-block transition-all">Influencer Tools</Link></li>
              <li><Link to="/" className="hover:text-blue-500 hover:translate-x-1 inline-block transition-all">How it Works</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="grid grid-cols-1 gap-4 text-sm">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link to="/blogs" className="hover:text-white transition">Blog</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/Refund-Policy" className="hover:text-white transition">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-xs text-slate-500">
            © 2026 <span className="text-slate-300 font-medium">vistafluence.com</span>. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
             <Link to="/privacy-policy" className="hover:text-white">Privacy</Link>
             <Link to="/terms-of-service" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;