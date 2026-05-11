import React, { useState } from "react";
import axios from "axios";
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

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        "https://vistafluence.onrender.com/api/articles",
        formData
      );

      alert("Article Published Successfully ✅");

      navigate("/");
    } catch (error) {
      console.log(error);

      alert("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl"
      >
        <h1 className="text-4xl font-bold text-white mb-8">
          Create Article
        </h1>

        <div className="space-y-5">

          <input
            type="text"
            name="title"
            placeholder="Article Title"
            required
            onChange={handleChange}
            className="w-full bg-slate-800 text-white p-4 rounded-xl outline-none"
          />

          <textarea
            name="description"
            placeholder="Article Description"
            required
            onChange={handleChange}
            className="w-full h-40 bg-slate-800 text-white p-4 rounded-xl outline-none"
          />

          <input
            type="text"
            name="image"
            placeholder="Image URL"
            required
            onChange={handleChange}
            className="w-full bg-slate-800 text-white p-4 rounded-xl outline-none"
          />

          <div className="grid md:grid-cols-2 gap-5">

            <input
              type="text"
              name="author"
              placeholder="Author Name"
              required
              onChange={handleChange}
              className="bg-slate-800 text-white p-4 rounded-xl outline-none"
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              required
              onChange={handleChange}
              className="bg-slate-800 text-white p-4 rounded-xl outline-none"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 transition-all duration-300 text-white py-4 rounded-xl font-bold"
          >
            {loading ? "Publishing..." : "Publish Article"}
          </button>

        </div>
      </form>
    </div>
  );
}

export default AddArticle;