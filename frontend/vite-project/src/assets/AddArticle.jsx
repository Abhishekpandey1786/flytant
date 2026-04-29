import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddArticle() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    author: "",
    category: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const oldArticles =
      JSON.parse(localStorage.getItem("articles")) || [];

    const newArticle = {
      id: Date.now(),
      ...formData,
      date: new Date().toLocaleDateString(),
    };

    const updatedArticles = [newArticle, ...oldArticles];

    localStorage.setItem(
      "articles",
      JSON.stringify(updatedArticles),
    );

    alert("Article Published Successfully ✅");

    navigate("/latestarticles");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-fuchsia-700 p-6 rounded-3xl w-full max-w-2xl shadow-2xl space-y-5"
      >
        <h1 className="text-4xl font-extrabold text-center text-fuchsia-400">
          Publish New Article
        </h1>

        <input
          type="text"
          name="title"
          placeholder="Article Title"
          onChange={handleChange}
          required
          className="w-full bg-slate-800 p-4 rounded-xl outline-none"
        />

        <textarea
          name="description"
          placeholder="Article Description"
          onChange={handleChange}
          required
          className="w-full bg-slate-800 p-4 rounded-xl outline-none h-40"
        />

        <input
          type="text"
          name="image"
          placeholder="Paste Image URL"
          onChange={handleChange}
          required
          className="w-full bg-slate-800 p-4 rounded-xl outline-none"
        />

        <input
          type="text"
          name="author"
          placeholder="Author Name"
          onChange={handleChange}
          required
          className="w-full bg-slate-800 p-4 rounded-xl outline-none"
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          onChange={handleChange}
          required
          className="w-full bg-slate-800 p-4 rounded-xl outline-none"
        />

        <button className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 py-4 rounded-xl font-bold text-lg transition-all">
          Publish Article
        </button>
      </form>
    </div>
  );
}

export default AddArticle;