import React, { useState } from "react";

import axios from "axios";

import {
  FaImage,
  FaUser,
  FaTag,
  FaPenFancy,
  FaArrowLeft,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function AddArticle() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    category: "",
  });

  const [image, setImage] = useState(null);

  const [preview, setPreview] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ==================================
  // HANDLE INPUT
  // ==================================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==================================
  // HANDLE IMAGE
  // ==================================
  const handleImage = (e) => {

    const file = e.target.files[0];

    if (file) {

      setImage(file);

      setPreview(
        URL.createObjectURL(file)
      );
    }
  };

  // ==================================
  // SUBMIT
  // ==================================
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const data = new FormData();

      data.append(
        "title",
        formData.title
      );

      data.append(
        "description",
        formData.description
      );

      data.append(
        "author",
        formData.author
      );

      data.append(
        "category",
        formData.category
      );

      data.append(
        "image",
        image
      );

      await axios.post(
        "https://vistafluence.onrender.com/api/articles",
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert(
        "Article Published Successfully ✅"
      );

      navigate("/");

    } catch (error) {

      console.log(error);

      alert("Upload Failed ❌");

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* Glow */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-fuchsia-600/20 blur-[150px] rounded-full"></div>

      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-cyan-500/20 blur-[150px] rounded-full"></div>

      {/* Main */}
      <div className="relative z-10 flex items-center justify-center p-5 md:p-10">

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl"
        >

          {/* Header */}
          <div className="flex items-center justify-between mb-10">

            <div>

              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                Create Article
              </h1>

              <p className="text-gray-400 mt-2">
                Publish trending content
              </p>

            </div>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="bg-white/10 hover:bg-white/20 transition p-4 rounded-2xl"
            >
              <FaArrowLeft />
            </button>

          </div>

          {/* Image Upload */}
          <label className="border-2 border-dashed border-fuchsia-500/40 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-fuchsia-500 transition group">

            {preview ? (
              <img
                src={preview}
                alt=""
                className="w-full h-[300px] object-cover rounded-2xl"
              />
            ) : (
              <>

                <div className="w-20 h-20 rounded-full bg-fuchsia-600/20 flex items-center justify-center text-3xl text-fuchsia-400 mb-4 group-hover:scale-110 transition">
                  <FaImage />
                </div>

                <h2 className="text-xl font-bold">
                  Upload Thumbnail
                </h2>

                <p className="text-gray-400 text-sm mt-2">
                  Click to upload image
                </p>

              </>
            )}

            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImage}
              required
            />

          </label>

          {/* Inputs */}
          <div className="space-y-6 mt-8">

            {/* Title */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">

              <FaPenFancy className="text-fuchsia-400 text-xl" />

              <input
                type="text"
                name="title"
                placeholder="Article Title"
                required
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-lg"
              />

            </div>

            {/* Description */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">

              <textarea
                name="description"
                placeholder="Write article description..."
                required
                onChange={handleChange}
                className="w-full h-40 bg-transparent outline-none resize-none"
              />

            </div>

            {/* Bottom */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Author */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">

                <FaUser className="text-cyan-400 text-xl" />

                <input
                  type="text"
                  name="author"
                  placeholder="Author Name"
                  required
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                />

              </div>

              {/* Category */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">

                <FaTag className="text-fuchsia-400 text-xl" />

                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  required
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                />

              </div>

            </div>

            {/* Button */}
            <button
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:scale-[1.02] transition-all duration-300 py-5 rounded-2xl text-lg font-bold shadow-lg shadow-fuchsia-500/20"
            >
              {loading
                ? "Publishing..."
                : "Publish Article 🚀"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default AddArticle;