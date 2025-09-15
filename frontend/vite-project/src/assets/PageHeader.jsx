import React from "react";
import { Link } from "react-router-dom";

const PageHeader = () => {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-fuchsia-800 sticky top-0 z-10">
      <nav className="flex justify-between items-center px-4 md:px-12 py-4 fixed top-0 left-0 right-0 z-50 bg-slate-800">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
                Flytant
              </h1>
              <div className="space-x-2 md:space-x-4">
                <Link to="/login">
                  <button className="neno-button shadow-x1 hover:shadow-fuchsia-800/50   text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-4xl py-2 md:py-4 px-4 md:px-8 text-sm md:text-base uppercase relative overflow-hidden">
                    Login | Signup
                  </button>
                </Link>
              </div>
            </nav>
    </div>
  );
};

export default PageHeader;