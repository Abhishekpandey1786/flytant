import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendarAlt, FaUserAlt, FaTrash, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

function LatestArticles() {
  const [articles, setArticles] = useState([]);

  const fetchArticles = async () => {
    const res = await axios.get("http://localhost:5000/api/articles");
    setArticles(res.data);
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this article?")) {
      await axios.delete(`http://localhost:5000/api/articles/${id}`);
      fetchArticles(); // List Refresh
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold">Trending Feed</h1>
          <Link to="/add" className="bg-fuchsia-600 p-3 rounded-full hover:scale-110 transition"><FaPlus /></Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div key={art._id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative group">
              <button onClick={() => handleDelete(art._id)} className="absolute top-4 right-4 bg-red-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition z-10">
                <FaTrash size={12} />
              </button>
              <img src={art.image} alt="" className="w-full h-48 object-cover" />
              <div className="p-5">
                <span className="text-fuchsia-400 text-xs font-bold uppercase">{art.category}</span>
                <h2 className="text-xl font-bold mt-2 line-clamp-1">{art.title}</h2>
                <p className="text-gray-400 text-sm mt-2 line-clamp-2">{art.description}</p>
                <div className="flex justify-between mt-4 text-xs text-gray-500 border-t border-slate-800 pt-4">
                  <span className="flex items-center gap-1"><FaUserAlt /> {art.author}</span>
                  <span className="flex items-center gap-1"><FaCalendarAlt /> {art.date}</span>
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