import React from "react";
import img1 from "./image/i1.webp";
import imgInfluencer from "./image/b1.webp";
import imgBrand from "./image/b2.webp";
import "../index.css";
import { Link } from "react-router-dom";
import Footer from "./Footer.jsx";

function Home() {
  return (
    <div className="min-h-screen bg-slate-800 text-white font-inter overflow-hidden flex flex-col">
      {/* Navbar - Your existing code */}
      <nav className="flex justify-between items-center px-4 md:px-12 py-4 fixed top-0 left-0 right-0 z-50 bg-slate-800">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
          InfluZone 
        </h1>
        <div className="space-x-2 md:space-x-4">
          <Link to="/login">
            <button className="neno-button shadow-x1 hover:shadow-fuchsia-800/50   text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-4xl py-2 md:py-4 px-4 md:px-8 text-sm md:text-base uppercase relative overflow-hidden">
              Login | Signup
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Your existing code */}
      <main className="flex-grow flex items-center justify-center pt-24 md:pt-32 pb-8 md:pb-12 px-4 md:px-16">
        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-8 md:gap-10">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Connecting <br className="hidden md:block" />
              Brands & Influencers
            </h2>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl mb-6 md:mb-8">
              Discover partners and grow together in your niche.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
              <Link to="/signup?role=advertiser">
                <button className="neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-4xl py-2 md:py-4 px-4 md:px-8 text-sm md:text-base uppercase relative overflow-hidden">
                  Advertiser
                </button>
              </Link>
              <Link to="/signup?role=influencer">
                <button className="neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-4xl py-2 md:py-4 px-4 md:px-8 text-sm md:text-base uppercase relative overflow-hidden">
                  Influencer
                </button>
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <img
              src={img1}
              alt="Influencer Marketing Platform"
              className="rounded-2xl shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-cover transition-transform duration-300 hover:scale-105 neno-button shadow-x1 hover:shadow-fuchsia-800/50"
            />
          </div>
        </div>
      </main>

      {/* About Section - Your existing code */}
      <section className="bg-slate-900 py-16 px-4 md:px-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">What is InfluZone?</h3>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
            InfluZone  is a dynamic platform that connects brands with the right influencers and helps influencers find brand deals that align with their passion. Our goal is to help you find the perfect partner to achieve your goals.
          </p>
        </div>
      </section>

      {/* How it Works Section - ✅ New section */}
      <section className="py-16 px-4 md:px-16 bg-slate-800 text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-12">How It Works</h3>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center p-6 bg-slate-700 rounded-xl shadow-lg neno-button shadow-x1 hover:shadow-fuchsia-800/50 transition">
            <span className="text-5xl mb-4">🚀</span>
            <h4 className="text-xl font-bold mb-2">1. Sign Up & Build Your Profile</h4>
            <p className="text-gray-300 text-sm">Choose your role (Influencer or Brand) and create your profile. Tell us about your interests and goals.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-slate-700 rounded-xl shadow-lg neno-button shadow-x1 hover:shadow-fuchsia-800/50 transition">
            <span className="text-5xl mb-4">🔍</span>
            <h4 className="text-xl font-bold mb-2">2. Find Your Partner</h4>
            <p className="text-gray-300 text-sm">Influencers can discover campaigns, and brands can find the perfect influencer. Our smart filtering helps you find the right match.</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-slate-700 rounded-xl shadow-lg neno-button shadow-x1 hover:shadow-fuchsia-800/50 transition">
            <span className="text-5xl mb-4">🤝</span>
            <h4 className="text-xl font-bold mb-2">3. Collaborate & Succeed</h4>
            <p className="text-gray-300 text-sm">Finalize deals, create content, and track your performance. Achieve success by working together.</p>
          </div>
        </div>
      </section>

      {/* Section for Influencers - Your existing code */}
      <section className="py-16 px-4 md:px-16 bg-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 lg:order-2">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">For Influencers</h3>
            <p className="text-gray-300 text-lg mb-6">
              Turn your passion into profit! InfluZone connects you with brands that are a perfect fit for your audience.
            </p>
            <ul className="text-gray-200 text-base space-y-3 mb-6 list-disc list-inside text-left">
              <li>Collaborate with your favorite brands.</li>
              <li>Discover new campaigns and apply easily.</li>
              <li>Work on your own terms and increase your earnings.</li>
              <li>Manage all your social profiles in one place.</li>
            </ul>
            <Link to="/signup?role=influencer">
              <button className="neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-4xl py-2 md:py-4 px-4 md:px-8 text-sm md:text-base uppercase relative overflow-hidden">
                Join as an Influencer
              </button>
            </Link>
          </div>
          <div className="flex-1 lg:order-1 relative">
            <img
              src={imgInfluencer}
              alt="Influencer collaborating"
              className="rounded-2xl shadow-xl w-full object-cover neno-button shadow-x1 hover:shadow-fuchsia-800/50 transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Section for Brands - Your existing code */}
      <section className="py-16 px-4 md:px-16 bg-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          
          <div className="flex-1">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">For Brands</h3>
            <p className="text-gray-300 text-lg mb-6">
              Boost your brand recognition and sales by connecting with the right influencers.
            </p>
            <ul className="text-gray-200 text-base space-y-3 mb-6 list-disc list-inside text-left">
              <li>Discover the perfect influencers to reach your target audience.</li>
              <li>Create and manage impactful campaigns.</li>
              <li>Track your campaign performance in real-time.</li>
              <li>Take your brand story to new heights.</li>
            </ul>
            <Link to="/signup?role=advertiser">
              <button className="neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-4xl py-2 md:py-4 px-4 md:px-8 text-sm md:text-base uppercase relative overflow-hidden">
                Join as a Brand
              </button>
            </Link>
          </div>
          <div className="flex-1 relative">
            <img
              src={imgBrand}
              alt="Brand dashboard"
              className="rounded-2xl shadow-xl w-full object-cover neno-button shadow-x1 hover:shadow-fuchsia-800/50 transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section - ✅ New section */}
      <section className="bg-slate-900 py-16 px-4 md:px-16 text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-12">What Our Users Say</h3>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-8 rounded-xl shadow-lg neno-button shadow-x1 hover:shadow-fuchsia-800/50 transition text-left">
            <p className="text-lg italic mb-4">"InfluZone has made working with brands incredibly easy. I found so many campaigns I love, and my earnings have grown significantly."</p>
            <p className="font-bold">- Priya, Fashion Influencer</p>
          </div>
          <div className="bg-slate-800 p-8 rounded-xl shadow-lg neno-button shadow-x1 hover:shadow-fuchsia-800/50 transition text-left">
            <p className="text-lg italic mb-4">"With InfluZone, we found the right influencers for our brand, which reduced our marketing costs and led to a huge increase in sales."</p>
            <p className="font-bold">- Rahul, Marketing Manager,  Brands</p>
          </div>
        </div>
      </section>

      {/* Final Call to Action - Your existing code */}
      <section className="bg-slate-800 py-16 px-4 md:px-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Join InfluZone Today!
          </h3>
          <p className="text-white text-lg md:text-xl mb-8">
            Whether you're a brand or an influencer, InfluZone provides the tools you need for success.
          </p>
          <Link to="/signup">
            <button className="neno-button shadow-x1 hover:shadow-fuchsia-800/50   text-white border-2 border-fuchsia-800 rounded-4xl py-2 md:py-4 px-4 md:px-8  md:text-base  relative overflow-hidden text-xl uppercase hover:bg-fuchsia-800 transition duration-300">
              Sign Up Now
            </button>
          </Link>
        </div>
      </section>

    <Footer/>
    </div>
  );
}

export default Home;