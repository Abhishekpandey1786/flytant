import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddArticle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", description: "", image: "", author: "", category: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/articles", formData);
      alert("Article Published to Database! ✅");
      navigate("/");
    } catch (error) {
      alert("Error saving article");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-fuchsia-700 p-8 rounded-3xl w-full max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold text-fuchsia-400 mb-4">Create Post</h1>
        <input name="title" placeholder="Title" onChange={handleChange} required className="w-full bg-slate-800 p-4 rounded-xl outline-none" />
        <textarea name="description" placeholder="Description" onChange={handleChange} required className="w-full bg-slate-800 p-4 rounded-xl h-32 outline-none" />
        <input name="image" placeholder="Image URL" onChange={handleChange} required className="w-full bg-slate-800 p-4 rounded-xl outline-none" />
        <div className="grid grid-cols-2 gap-4">
          <input name="author" placeholder="Author" onChange={handleChange} required className="bg-slate-800 p-4 rounded-xl outline-none" />
          <input name="category" placeholder="Category" onChange={handleChange} required className="bg-slate-800 p-4 rounded-xl outline-none" />
        </div>
        <button className="w-full bg-fuchsia-600 py-4 rounded-xl font-bold hover:bg-fuchsia-700 transition">Publish Article</button>
      </form>
    </div>
  );
}
export default AddArticle;