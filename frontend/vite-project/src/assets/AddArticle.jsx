import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  FaImage,
  FaUser,
  FaTag,
  FaPenFancy,
  FaArrowLeft,
  FaTrash,
  FaCalendarAlt,
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

  // ======================================
  // HANDLE INPUT
  // ======================================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ======================================
  // HANDLE IMAGE
  // ======================================
  const handleImage = (e) => {

    const file = e.target.files[0];

    if (file) {

      setImage(file);

      setPreview(
        URL.createObjectURL(file)
      );
    }
  };

  // ======================================
  // SUBMIT
  // ======================================
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

      setFormData({
        title: "",
        description: "",
        author: "",
        category: "",
      });

      setImage(null);

      setPreview("");

      fetchArticles();

    } catch (error) {

      console.log(error);

      alert("Upload Failed ❌");

    } finally {

      setLoading(false);
    }
  };

  // ======================================
  // DELETE
  // ======================================
  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this article?"
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
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* Glow */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-fuchsia-600/20 blur-[150px] rounded-full"></div>

      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-cyan-500/20 blur-[150px] rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">

        {/* Top */}
        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-black bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
              Creator Studio
            </h1>

            <p className="text-gray-400 mt-2">
              Publish & manage your articles
            </p>

          </div>

          <button
            onClick={() => navigate("/")}
            className="bg-white/10 hover:bg-white/20 transition p-4 rounded-2xl"
          >
            <FaArrowLeft />
          </button>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl"
        >

          {/* Upload */}
          <label className="border-2 border-dashed border-fuchsia-500/40 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-fuchsia-500 transition group">

            {preview ? (
              <img
                src={preview}
                alt=""
                className="w-full h-[320px] object-cover rounded-2xl"
              />
            ) : (
              <>

                <div className="w-24 h-24 rounded-full bg-fuchsia-600/20 flex items-center justify-center text-4xl text-fuchsia-400 mb-4">
                  <FaImage />
                </div>

                <h2 className="text-2xl font-bold">
                  Upload Thumbnail
                </h2>

                <p className="text-gray-400 mt-2">
                  Click here to upload image
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

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">

              <FaPenFancy className="text-fuchsia-400 text-xl" />

              <input
                type="text"
                name="title"
                placeholder="Article Title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-lg"
              />

            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

              <textarea
                name="description"
                placeholder="Write article description..."
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full h-40 bg-transparent outline-none resize-none"
              />

            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">

                <FaUser className="text-cyan-400 text-xl" />

                <input
                  type="text"
                  name="author"
                  placeholder="Author Name"
                  required
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                />

              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">

                <FaTag className="text-fuchsia-400 text-xl" />

                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none"
                />

              </div>

            </div>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:scale-[1.02] transition-all duration-300 py-5 rounded-2xl text-lg font-bold"
            >
              {loading
                ? "Publishing..."
                : "Publish Article 🚀"}
            </button>

          </div>

        </form>

        {/* ARTICLES */}
        <div className="mt-20">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-4xl font-black">
                Your Articles
              </h2>

              <p className="text-gray-400 mt-2">
                Manage published content
              </p>

            </div>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {articles.map((article) => (

              <div
                key={article._id}
                className="group bg-white/5 border border-white/10 rounded-[30px] overflow-hidden hover:-translate-y-2 transition duration-300"
              >

                {/* IMAGE */}
                <div className="relative overflow-hidden">

                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-60 object-cover group-hover:scale-110 transition duration-500"
                  />

                  <button
                    onClick={() =>
                      handleDelete(article._id)
                    }
                    className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 transition p-3 rounded-xl"
                  >
                    <FaTrash />
                  </button>

                </div>

                {/* CONTENT */}
                <div className="p-6">

                  <span className="text-fuchsia-400 text-xs uppercase font-bold tracking-widest">
                    {article.category}
                  </span>

                  <h2 className="text-2xl font-bold mt-3 line-clamp-2">
                    {article.title}
                  </h2>

                  <p className="text-gray-400 mt-3 line-clamp-3">
                    {article.description}
                  </p>

                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10 text-sm text-gray-500">

                    <span className="flex items-center gap-2">
                      <FaUserAlt />
                      {article.author}
                    </span>

                    <span className="flex items-center gap-2">
                      <FaCalendarAlt />
                      {new Date(
                        article.createdAt
                      ).toLocaleDateString()}
                    </span>

                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

export default AddArticle;