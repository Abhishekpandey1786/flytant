import React, { useEffect, useState } from "react";

import axios from "axios";

import {
  FaCalendarAlt,
  FaPlus,
  FaArrowLeft,
  FaFire,
  FaClock,
} from "react-icons/fa";

import { Link } from "react-router-dom";

function LatestArticles() {
  const [articles, setArticles] = useState([]);

  // ===============================
  // SELECTED ARTICLE
  // ===============================
  const [selectedArticle, setSelectedArticle] = useState(null);

  // ===============================
  // FETCH ARTICLES
  // ===============================
  const fetchArticles = async () => {
    try {
      const res = await axios.get(
        "https://vistafluence.onrender.com/api/articles",
      );

      setArticles(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // ====================================
  // SINGLE ARTICLE VIEW
  // ====================================
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        {/* HERO */}
        <div className="relative h-[85vh] overflow-hidden">
          <img
            src={selectedArticle.image}
            alt=""
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20"></div>

          {/* BACK */}
          <button
            onClick={() => setSelectedArticle(null)}
            className="absolute top-8 left-8 z-20 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl hover:bg-fuchsia-600 transition flex items-center gap-3"
          >
            <FaArrowLeft />
            Back
          </button>

          {/* CONTENT */}
          <div className="absolute bottom-0 left-0 w-full z-10 p-6 md:p-20">
            <span className="bg-fuchsia-600 px-5 py-2 rounded-full text-xs uppercase tracking-[3px] font-bold">
              {selectedArticle.category}
            </span>

            <h1 className="text-5xl md:text-7xl font-black leading-tight max-w-6xl mt-8">
              {selectedArticle.title}
            </h1>

            {/* INFO */}
            <div className="flex flex-wrap gap-8 mt-10 text-gray-300">
              <div>
                <p className="text-sm text-gray-500">Written By</p>

                <h3 className="text-xl font-bold mt-1">
                  {selectedArticle.author}
                </h3>
              </div>

              <div>
                <p className="text-sm text-gray-500">Published</p>

                <h3 className="text-xl font-bold mt-1 flex items-center gap-3">
                  <FaCalendarAlt />

                  {new Date(selectedArticle.createdAt).toLocaleDateString()}
                </h3>
              </div>

              <div>
                <p className="text-sm text-gray-500">Reading Time</p>

                <h3 className="text-xl font-bold mt-1 flex items-center gap-3">
                  <FaClock />5 Min Read
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* ARTICLE BODY */}
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-14 backdrop-blur-xl">
            {/* ARTICLE TEXT */}
            <div className="space-y-10">
              <p className="text-2xl leading-relaxed text-gray-200 font-light">
                {selectedArticle.description}
              </p>

              <div className="w-full h-[1px] bg-white/10"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        {/* IMAGE */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1600&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />

          <div className="absolute inset-0 bg-black/80"></div>
        </div>

        {/* GLOW */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-fuchsia-600/20 blur-[150px] rounded-full"></div>

        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/20 blur-[150px] rounded-full"></div>

        {/* CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 bg-fuchsia-600/10 border border-fuchsia-500/20 px-5 py-2 rounded-full text-fuchsia-400 text-sm mb-8">
              <FaFire />
              Trending Stories Worldwide
            </div>

            <h1 className="text-6xl md:text-7xl font-black leading-tight">
              Modern Digital
              <span className="block bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                Magazine
              </span>
            </h1>

            <p className="text-gray-400 text-xl leading-relaxed mt-8 max-w-2xl">
              Read premium articles about technology, startups, business,
              design, AI and modern internet culture.
            </p>

            <div className="flex gap-5 mt-10">
              <Link
                to="/add"
                className="bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition duration-300 flex items-center gap-3 shadow-2xl shadow-fuchsia-500/20"
              >
                <FaPlus />
                Publish Article
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {/* TOP */}
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-5xl font-black">Latest Articles</h2>

            <p className="text-gray-500 mt-4 text-lg">
              Discover the newest stories
            </p>
          </div>

          <div className="hidden md:block bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
            <p className="text-sm text-gray-500">Published Articles</p>

            <h3 className="text-3xl font-black mt-1">{articles.length}</h3>
          </div>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">
          {articles.map((article) => (
            <div
              key={article._id}
              onClick={() => setSelectedArticle(article)}
              className="group cursor-pointer bg-[#111111] border border-white/10 rounded-[35px] overflow-hidden hover:-translate-y-3 transition-all duration-500"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden">
                <img
                  src={article.image}
                  alt=""
                  className="w-full h-72 object-cover group-hover:scale-110 transition duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                <span className="absolute top-5 left-5 bg-black/70 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold text-fuchsia-400">
                  {article.category}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-7">
                <h2 className="text-3xl font-black leading-snug line-clamp-2 group-hover:text-fuchsia-400 transition">
                  {article.title}
                </h2>

                <p className="text-gray-400 mt-5 leading-relaxed line-clamp-3">
                  {article.description}
                </p>

                {/* FOOTER */}
                <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/10">
                  <div>
                    <p className="font-semibold">{article.author}</p>

                    <p className="text-gray-500 text-sm flex items-center gap-2 mt-2">
                      <FaCalendarAlt />

                      {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LatestArticles;
