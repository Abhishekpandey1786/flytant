import React, { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaUserAlt,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

function Latestarticles() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const savedArticles =
      JSON.parse(localStorage.getItem("articles")) || [];

    setArticles(savedArticles);
  }, []);

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Latest Articles
          </h1>

          <p className="text-gray-400 text-sm sm:text-base">
            Daily updated blogs, creator news & trending insights
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12 relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-fuchsia-600 rounded-full py-4 px-6 pl-14 outline-none focus:ring-2 focus:ring-fuchsia-500 text-white"
          />

          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-fuchsia-400 text-lg" />
        </div>

        {/* Empty */}
        {filteredArticles.length === 0 ? (
          <div className="text-center text-gray-400 text-2xl mt-20">
            No Articles Found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden cursor-pointer hover:border-fuchsia-500 hover:shadow-[0_0_25px_rgba(217,70,239,0.25)] transition-all duration-300 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Category */}
                  <span className="bg-fuchsia-600/20 text-fuchsia-400 text-xs px-3 py-1 rounded-full font-semibold">
                    {article.category}
                  </span>

                  {/* Title */}
                  <h2 className="text-2xl font-bold mt-4 mb-3 line-clamp-2">
                    {article.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-7 line-clamp-3">
                    {article.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-6 text-xs text-gray-500 border-t border-slate-800 pt-4">
                    <div className="flex items-center gap-2">
                      <FaUserAlt className="text-fuchsia-400" />
                      <span>{article.author}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-fuchsia-400" />
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-fuchsia-600 rounded-3xl overflow-hidden w-full max-w-5xl max-h-[92vh] overflow-y-auto relative shadow-[0_0_40px_rgba(217,70,239,0.35)]">

            {/* Close Button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 bg-red-600 hover:bg-red-700 w-11 h-11 rounded-full flex items-center justify-center transition-all z-50"
            >
              <FaTimes className="text-white text-lg" />
            </button>

            {/* Banner Image */}
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="w-full h-[250px] sm:h-[400px] object-cover"
            />

            {/* Content */}
            <div className="p-6 sm:p-10">
              {/* Category */}
              <span className="bg-fuchsia-600/20 text-fuchsia-400 text-xs px-4 py-2 rounded-full font-bold uppercase tracking-widest">
                {selectedArticle.category}
              </span>

              {/* Title */}
              <h2 className="text-3xl sm:text-5xl font-extrabold mt-6 leading-tight">
                {selectedArticle.title}
              </h2>

              {/* Meta */}
              <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-400 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-2">
                  <FaUserAlt className="text-fuchsia-400" />
                  <span>{selectedArticle.author}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-fuchsia-400" />
                  <span>{selectedArticle.date}</span>
                </div>
              </div>

              {/* Article */}
              <div className="mt-8">
                <p className="text-gray-300 text-lg leading-9 whitespace-pre-line">
                  {selectedArticle.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Latestarticles;