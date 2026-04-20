import React from "react";
import img1 from "./image/i1.webp";
import imgInfluencer from "./image/b1.webp";
import imgBrand from "./image/b2.webp";
import "../index.css";
import { Link } from "react-router-dom";
import Footer from "./Footer.jsx";

function Home() {
  return (
    <div className="min-h-screen bg-slate-800 text-white font-inter overflow-x-hidden flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 md:px-12 py-4 fixed top-0 left-0 right-0 z-50 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Link to="/" aria-label="Vistafluence Home">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-white">
              vistafluence.com
            </h1>
          </Link>
        </div>
        <div className="space-x-2 md:space-x-4">
          <Link to="/login" aria-label="Login or Signup to your account">
            <button className="neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-full py-2 md:py-3 px-4 md:px-8 text-sm md:text-base uppercase transition-all duration-300">
              Login | Signup
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center pt-32 md:pt-40 pb-12 px-4 md:px-16">
        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight bg-white bg-clip-text text-transparent">
              Connecting <br className="hidden md:block" />
              Brands & Influencers
            </h2>
            <p className="text-white text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl">
              The premier bidirectional marketplace to discover partners and grow together in your niche.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link to="/signup?role=advertiser" aria-label="Sign up as a Brand or Advertiser">
                <button className="w-full sm:w-auto neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-full py-3 px-8 text-base uppercase font-bold tracking-wider">
                   BRAND
                </button>
              </Link>
              <Link to="/signup?role=influencer" aria-label="Sign up as an Influencer">
                <button className="w-full sm:w-auto neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-full py-3 px-8 text-base uppercase font-bold tracking-wider">
                  INFLUENCER
                </button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center lg:justify-end ">
            <div className="w-full max-w-md lg:max-w-lg aspect-[480/438] bg-slate-700/20 rounded-3xl overflow-hidden  neno-button shadow-xl hover:shadow-fuchsia-800/50">
              <img
                src={img1}
                width="480"
                height="438"
                fetchpriority="high"
                loading="eager"
                alt="Vistafluence Platform Interface showing Influencer Analytics"
                className="w-full h-full object-cover transition-transform duration-500 hover:rotate-2 border border-slate-700"
              />
            </div>
          </div>
        </div>
      </main>

      {/* About Section */}
      <section className="bg-slate-900 py-20 px-4 md:px-16 border-y border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">
            What is Vistafluence?
          </h2>
          <p className="text-white text-xl md:text-2xl leading-relaxed font-light">
            A dynamic ecosystem that bridges the gap between creative talent and industry leaders. 
            We provide the data and tools to ensure every collaboration is a masterpiece.
          </p>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 px-4 md:px-16 bg-slate-800 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-16">The Simple 3-Step Process</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "🚀", title: "1. Create Profile", desc: "Showcase your niche or brand identity with our advanced profile builder." },
            { icon: "🔍", title: "2. Smart Discovery", desc: "Use deep-filtering to find partners that share your exact target audience." },
            { icon: "🤝", title: "3. Launch & Scale", desc: "Manage contracts, track real-time ROI, and grow your digital footprint." }
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center p-10 bg-slate-700/50 rounded-3xl border border-slate-600 hover:border-fuchsia-500 transition-all duration-300 group neno-button shadow-xl hover:shadow-fuchsia-800/50">
              <span className="text-6xl mb-6 group-hover:scale-110 transition-transform" role="img" aria-label={step.title}>{step.icon}</span>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-gray-300 text-base leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section for Influencers */}
      <section className="py-20 px-4 md:px-16 bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">For Influencers</h2>
            <p className="text-gray-300 text-xl mb-8 leading-relaxed">
              Monetize your creativity without the stress of cold emails. We bring high-value campaigns directly to your dashboard.
            </p>
            <ul className="text-gray-200 text-lg space-y-4 mb-10 list-none inline-block text-left">
              <li className="flex items-center gap-3">
                <span className="text-fuchsia-500" aria-hidden="true">✔</span> Secure Payment Protection
              </li>
              <li className="flex items-center gap-3">
                <span className="text-fuchsia-500" aria-hidden="true">✔</span> Exclusive Brand Partnerships
              </li>
              <li className="flex items-center gap-3">
                <span className="text-fuchsia-500" aria-hidden="true">✔</span> Advanced Performance Analytics
              </li>
            </ul>
            <div className="block">
              <Link to="/signup?role=influencer" aria-label="Register as an Influencer today">
                <button className="neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white border-2 border-fuchsia-800 rounded-full py-4 px-10 text-lg font-bold uppercase hover:bg-fuchsia-800 transition">
                  Start Earning Now
                </button>
              </Link>
            </div>
          </div>
          <div className="flex-1 lg:order-1">
            <div className="w-full aspect-[480/438] bg-slate-800 rounded-3xl overflow-hidden  neno-button shadow-xl hover:shadow-fuchsia-800/50">
              <img
                src={imgInfluencer}
                width="480"
                height="438"
                loading="lazy" 
                alt="Influencer earning insights dashboard"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section for Brands */}
      <section className="py-20 px-4 md:px-16 bg-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">For Brands</h2>
            <p className="text-gray-300 text-xl mb-8 leading-relaxed">
              Stop guessing and start growing. Connect with vetted influencers who deliver authentic engagement.
            </p>
            <ul className="text-gray-200 text-lg space-y-4 mb-10 list-none inline-block text-left">
              <li className="flex items-center gap-3">
                <span className="text-blue-400" aria-hidden="true">✔</span> Vetted Influencer Database
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400" aria-hidden="true">✔</span> Automated Campaign Management
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400" aria-hidden="true">✔</span> Real-time ROI Tracking
              </li>
            </ul>
            <div className="block">
              <Link to="/signup?role=advertiser" aria-label="Register as a Brand partner">
                <button className="neno-button  text-white border-2  neno-button border-fuchsia-800 shadow-xl hover:shadow-fuchsia-800/50 rounded-full py-4 px-10 text-lg font-bold uppercase hover:bg-fuchsia-700 transition">
                  Launch Your Campaign
                </button>
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full aspect-[600/518] bg-slate-700 rounded-3xl overflow-hidden border-fuchsia-800 neno-button shadow-xl hover:shadow-fuchsia-800/50">
              <img
                src={imgBrand}
                width="600"
                height="518"
                loading="lazy"
                alt="Marketing Manager analyzing campaign success"
                className="w-full h-full object-cover border-4 border-slate-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-900 py-24 px-4 md:px-16 text-center ">
        <h2 className="text-3xl md:text-5xl font-bold mb-16">Community Feedback</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 ">
          <blockquote className="bg-slate-800 p-10 rounded-3xl border-l-8 border-fuchsia-600 text-left relative  order-fuchsia-800 neno-button shadow-xl hover:shadow-fuchsia-800/50">
            <p className="text-xl italic mb-6 text-gray-200 leading-relaxed ">
              "Vistafluence has simplified my workflow. I no longer hunt for brands; they find me based on my engagement metrics."
            </p>
            <cite className="not-italic font-bold text-fuchsia-400">— Priya, Fashion Influencer</cite>
          </blockquote>
          <blockquote className="bg-slate-800 p-10 rounded-3xl border-l-8 border-fuchsia-600 text-left relative  order-fuchsia-800 neno-button shadow-xl hover:shadow-fuchsia-800/50">
            <p className="text-xl italic mb-6 text-gray-200 leading-relaxed">
              "The ability to track conversions in real-time changed our marketing strategy. Our CAC has dropped by 40%."
            </p>
            <cite className="not-italic font-bold text-fuchsia-400">— Rahul, Marketing Manager</cite>
          </blockquote>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-24 px-4 md:px-16 text-center">
        <div className="max-w-4xl mx-auto bg-slate-700/30 p-12 rounded-[3rem] border border-slate-600 shadow-2xl backdrop-blur-md">
          <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to Scale?</h2>
          <p className="text-gray-300 text-xl md:text-2xl mb-12">
            Join thousands of creators and brands already growing on vistafluence.com.
          </p>
          <Link to="/signup" aria-label="Final call to action: Sign up for Vistafluence">
            <button className="neno-button shadow-2xl hover:shadow-fuchsia-800/80 text-white border-2 border-fuchsia-800 rounded-full py-5 px-12 text-2xl font-black uppercase hover:bg-fuchsia-800 transition-all duration-500 ">
              Get Started Now
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;