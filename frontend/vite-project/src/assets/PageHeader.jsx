import React from "react";
import { Link } from "react-router-dom";

const PageHeader = () => {
  return (
    <nav className="flex justify-between items-center px-4 md:px-10 py-4 md:py-6 sticky top-0 bg-slate-900/90 backdrop-blur-md z-50">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
                <div className="absolute w-5 h-7 md:w-6 md:h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-tr-xl rounded-bl-sm transform skew-x-[-20deg] translate-x-1.5 md:translate-x-2"></div>
                <div className="absolute w-5 h-7 md:w-6 md:h-8 bg-gradient-to-tr from-pink-500 to-magenta-600 rounded-tl-xl rounded-br-sm transform skew-x-[20deg] -translate-x-1.5 md:-translate-x-2"></div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg md:text-2xl font-black tracking-tighter bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent uppercase">
                  Vistafluence
                </span>
                <span className=" md:block md:text-[9px] text-[7px] tracking-[0.2em] text-slate-400 font-bold uppercase">
                  No Middlemen. Just Real Collaborations.
                </span>
              </div>
            </div>
    
            <div className="flex gap-2 md:gap-4">
              <button className="hidden sm:block bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition text-xs md:text-sm border border-slate-700">
                Contact
              </button>
              <Link to="/login">
                <button className="neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white bg-fuchsia-700 hover:bg-fuchsia-700 border-fuchsia-700 transition px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-bold  text-xs md:text-sm whitespace-nowrap">
                  Login | Signup
                </button>
              </Link>
            </div>
          </nav>
  );
};

export default PageHeader;