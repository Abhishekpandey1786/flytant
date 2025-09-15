import React from "react";
import PageHeader from "./PageHeader";
import { FaEnvelope, FaHeadset, FaPhoneAlt, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white relative overflow-hidden">
      <PageHeader />

      {/* Floating Background Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="relative max-w-6xl mx-auto p-6 md:p-12 z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
            Get in Touch
          </h2>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            Have questions or need help? We’re just a message away.  
            Our team is always ready to assist <span className="text-fuchsia-400">brands</span> and <span className="text-fuchsia-400">influencers</span>.
          </p>
        </div>

        {/* Contact Info + Form Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-fuchsia-500/40 hover:scale-[1.02] transition duration-300">
              <div className="flex items-center gap-3 mb-2">
                <FaEnvelope className="text-fuchsia-400 text-2xl" />
                <h4 className="text-xl font-semibold">General Inquiries</h4>
              </div>
              <p className="text-gray-300">
                Email us at{" "}
                <a href="mailto:info@flytant.com" className="text-fuchsia-400 hover:underline">
                  info@flytant.com
                </a>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-fuchsia-500/40 hover:scale-[1.02] transition duration-300">
              <div className="flex items-center gap-3 mb-2">
                <FaHeadset className="text-fuchsia-400 text-2xl" />
                <h4 className="text-xl font-semibold">Support</h4>
              </div>
              <p className="text-gray-300">
                For technical issues:{" "}
                <a href="mailto:support@flytant.com" className="text-fuchsia-400 hover:underline">
                  support@flytant.com
                </a>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-fuchsia-500/40 hover:scale-[1.02] transition duration-300">
              <div className="flex items-center gap-3 mb-2">
                <FaPhoneAlt className="text-fuchsia-400 text-2xl" />
                <h4 className="text-xl font-semibold">Phone</h4>
              </div>
              <p className="text-gray-300">+91 98765 43210</p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-6 mt-6">
              <a href="#" className="text-gray-400 hover:text-fuchsia-400 text-2xl transition">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-fuchsia-400 text-2xl transition">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-fuchsia-400 text-2xl transition">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <form className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-fuchsia-500/40 space-y-6">
            <h3 className="text-2xl font-bold mb-4 text-fuchsia-400">Send Us a Message</h3>
            <div>
              <label className="block text-sm mb-2">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-gray-600 text-white focus:border-fuchsia-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Your Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-gray-600 text-white focus:border-fuchsia-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Message</label>
              <textarea
                rows="4"
                placeholder="Type your message..."
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-gray-600 text-white focus:border-fuchsia-400 outline-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:opacity-90 transition text-white font-semibold shadow-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
