import React from "react";
import img1 from "./image/img1.png";
import "../index.css"; 
import { Link } from "react-router-dom";
import img2 from "./image/i2.png";

function Home() {
  return (
    <div className="min-h-screen bg-slate-800 text-white font-inter overflow-hidden flex flex-col">
      <nav className="flex justify-between items-center px-6 md:px-12 py-4 fixed top-0 left-0 right-0 z-50 bg-slate-800">
        <h1 className="text-3xl font-extrabold tracking-wide">Flytant</h1>
        <div className="space-x-4">
         <Link to="/login"> <button className="neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-4xl py-4 px-8 uppercase relative overflow-hiddene">
            Login | Signup
          </button></Link>
        </div>
      </nav>
      <main className="flex-grow flex items-center justify-center pt-32 pb-12 px-6 md:px-16">
        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Connecting <br className="hidden md:block" />
              Brands & Influencers
            </h2>
            <p className="text-gray-300 text-lg md:text-xl mb-8">
              Discover partners and grow together in your niche.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button className="neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-4xl py-4 px-8 uppercase relative overflow-hidden">
                    Advitiser
                  </button>
              <button className="neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-4xl py-4 px-8 uppercase relative overflow-hidden">
                    Influencer
                  </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <img
              src={img1}
              alt="Influencer"
              className="rounded-2xl shadow-xl w-full max-w-lg object-cover transition-transform duration-300 hover:scale-105 neno-button shadow-x1 hover:shadow-fuchsia-800/50"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
