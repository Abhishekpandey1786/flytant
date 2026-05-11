import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaUserAlt,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

import { Link } from "react-router-dom";

function LatestArticles() {
  const [articles, setArticles] = useState([]);

  // ===============================
  // FETCH ARTICLES
  // ===============================
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

  // ===============================
  // DELETE ARTICLE
  // ===============================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://vistafluence.onrender.com/api/articles/${id}`
      );

      fetchArticles();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">

          <h1 className="text-4xl font-bold">
            Latest Articles
          </h1>

          <Link
            to="/add"
            className="bg-fuchsia-600 hover:scale-110 transition p-4 rounded-full"
          >
            <FaPlus />
          </Link>

        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {articles.map((article) => (
            <div
              key={article._id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group relative hover:-translate-y-2 transition duration-300"
            >

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(article._id)}
                className="absolute top-4 right-4 bg-red-600 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition"
              >
                <FaTrash size={12} />
              </button>

              {/* Image */}
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-56 object-cover"
              />

              {/* Content */}
              <div className="p-6">

                <span className="text-fuchsia-400 text-xs uppercase font-bold">
                  {article.category}
                </span>

                <h2 className="text-2xl font-bold mt-2 line-clamp-2">
                  {article.title}
                </h2>

                <p className="text-gray-400 mt-3 line-clamp-3">
                  {article.description}
                </p>

                {/* Footer */}
                <div className="flex justify-between items-center text-sm text-gray-500 border-t border-slate-800 mt-6 pt-4">

                  <span className="flex items-center gap-2">
                    <FaUserAlt />
                    {article.author}
                  </span>

                  <span className="flex items-center gap-2">
                    <FaCalendarAlt />
                    {new Date(article.createdAt).toLocaleDateString()}
                  </span>

                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LatestArticles;