import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  FaCalendarAlt,
  FaUserAlt,
  FaPlus,
  FaArrowRight,
  FaFire,
} from "react-icons/fa";

import { Link } from "react-router-dom";

function LatestArticles() {

  const [articles, setArticles] =
    useState([]);

  // ======================================
  // FETCH ARTICLES
  // ======================================
  const fetchArticles = async () => {

    try {

      const res = await axios.get(
        "https://vistafluence.onrender.com/api/articles"
      );

      setArticles(res.data);

    } catch (error) {

      console.log(error);
    }
  };

  useEffect(() => {

    fetchArticles();

  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-250px] left-[-250px] w-[500px] h-[500px] bg-fuchsia-600/20 blur-[180px] rounded-full"></div>

      <div className="absolute bottom-[-250px] right-[-250px] w-[500px] h-[500px] bg-cyan-500/20 blur-[180px] rounded-full"></div>

      <div className="relative z-10">

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">

          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

            {/* LEFT */}
            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-3 bg-white/10 border border-white/10 px-5 py-2 rounded-full text-sm text-fuchsia-300 mb-6 backdrop-blur-xl">

                <FaFire />

                Trending News & Insights

              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-tight">

                Explore Modern

                <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                  {" "}Articles
                </span>

              </h1>

              <p className="text-gray-400 text-lg mt-6 leading-relaxed">

                Discover trending stories, business insights,
                technology updates and modern digital content
                crafted for the next generation.

              </p>

              <div className="flex gap-5 mt-10">

                <Link
                  to="/add"
                  className="bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:scale-105 transition-all duration-300 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-fuchsia-500/20"
                >

                  <FaPlus />

                  Create Article

                </Link>

              </div>

            </div>

            {/* RIGHT */}
            <div className="relative">

              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 blur-3xl rounded-full"></div>

              <img
                src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop"
                alt=""
                className="relative w-full max-w-xl h-[500px] object-cover rounded-[40px] border border-white/10"
              />

            </div>

          </div>

        </section>

        {/* ARTICLES */}
        <section className="max-w-7xl mx-auto px-6 pb-20">

          {/* TOP */}
          <div className="flex items-center justify-between mb-12">

            <div>

              <h2 className="text-4xl md:text-5xl font-black">
                Latest Articles
              </h2>

              <p className="text-gray-400 mt-3">
                Fresh modern content from creators
              </p>

            </div>

            <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-xl">

              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>

              {articles.length} Articles Live

            </div>

          </div>

          {/* GRID */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-10">

            {articles.map((article) => (

              <div
                key={article._id}
                className="group bg-white/5 border border-white/10 rounded-[35px] overflow-hidden hover:-translate-y-3 transition-all duration-500 backdrop-blur-xl"
              >

                {/* IMAGE */}
                <div className="relative overflow-hidden">

                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-72 object-cover group-hover:scale-110 transition duration-700"
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                  {/* CATEGORY */}
                  <div className="absolute top-5 left-5">

                    <span className="bg-fuchsia-600/90 backdrop-blur-xl px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold">

                      {article.category}

                    </span>

                  </div>

                </div>

                {/* CONTENT */}
                <div className="p-7">

                  <h2 className="text-2xl font-black leading-snug line-clamp-2 group-hover:text-fuchsia-400 transition">

                    {article.title}

                  </h2>

                  <p className="text-gray-400 mt-4 leading-relaxed line-clamp-3">

                    {article.description}

                  </p>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/10">

                    <div className="flex items-center gap-4">

                      <div className="w-11 h-11 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-500 flex items-center justify-center font-bold">

                        {article.author?.charAt(0)}

                      </div>

                      <div>

                        <p className="text-sm font-semibold">
                          {article.author}
                        </p>

                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">

                          <FaCalendarAlt />

                          {new Date(
                            article.createdAt
                          ).toLocaleDateString()}

                        </p>

                      </div>

                    </div>

                    {/* READ */}
                    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-fuchsia-600 transition">

                      <FaArrowRight />

                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>

        </section>

      </div>
    </div>
  );
}

export default LatestArticles;