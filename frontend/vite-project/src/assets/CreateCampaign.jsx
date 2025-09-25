import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlusCircle } from "react-icons/fa";

function CreateCampaign() {
  const [campaignData, setCampaignData] = useState({
    name: "",
    description: "",
    budget: "",
    platforms: [],
    requiredNiche: [],
    cta: "",
    endDate: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // ✅ Token check on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to create a campaign.");
      navigate("/login");
    }
  }, [navigate]);

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaignData({ ...campaignData, [name]: value });
  };

  // Checkbox change
  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setCampaignData((prevState) => {
      const newArray = checked
        ? [...prevState[name], value]
        : prevState[name].filter((item) => item !== value);
      return { ...prevState, [name]: newArray };
    });
  };

  // Image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authentication failed. Please log in again.");
      return;
    }

    const formData = new FormData();
    for (const key in campaignData) {
      if (Array.isArray(campaignData[key])) {
        campaignData[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, campaignData[key]);
      }
    }
    if (image) {
      formData.append("image", image);
    }

    try {
      await axios.post("https://influezone.onrender.com/api/campaigns", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Campaign created successfully!");
      navigate("/dashboard/brand");
    } catch (error) {
      console.error(
        "Error creating campaign:",
        error.response?.data || error.message
      );
      alert("Failed to create campaign. Please try again.");
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-gray-100 p-8 ">
      <div className="max-w-4xl mx-auto">
        <div className="w-full bg-slate-800 rounded-2xl shadow-xl border border-fuchsia-800 p-8 md:p-12 neno-button  hover:shadow-fuchsia-800/50">
          <h2 className="text-3xl font-extrabold text-white text-center mb-8  ">
            Create a New Campaign
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Campaign Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="e.g., Summer Sale 2025"
                  value={campaignData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all duration-200 neno-button shadow-xl hover:shadow-fuchsia-800/50"
                />
              </div>
              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Budget (in ₹)
                </label>
                <input
                  type="number"
                  name="budget"
                  id="budget"
                  placeholder="e.g., 50000"
                  value={campaignData.budget}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all duration-200 neno-button shadow-xl hover:shadow-fuchsia-800/50"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                placeholder="Describe your campaign goals and requirements..."
                value={campaignData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all duration-200 neno-button shadow-xl hover:shadow-fuchsia-800/50"
              ></textarea>
            </div>

            {/* CTA + End Date */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="cta"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Call to Action (Optional)
                </label>
                <input
                  type="text"
                  name="cta"
                  id="cta"
                  placeholder="e.g., 'Click Here to Shop!'"
                  value={campaignData.cta}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all duration-200 neno-button shadow-xl hover:shadow-fuchsia-800/50"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Campaign End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  value={campaignData.endDate}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all duration-200 neno-button shadow-xl hover:shadow-fuchsia-800/50"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Brand Image / Logo
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1 text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-800 file:text-white hover:file:bg-fuchsia-700 cursor-pointer transition-colors duration-200 "
                />
                {imagePreview && (
                  <div className="flex-shrink-0 w-24 h-24 rounded-full border-2 border-fuchsia-600 overflow-hidden shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Platforms
              </label>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {["Instagram", "YouTube", "TikTok", "Facebook", "Twitter"].map(
                  (platform) => (
                    <label
                      key={platform}
                      className="flex items-center space-x-2 cursor-pointer text-gray-400 "
                    >
                      <input
                        type="checkbox"
                        name="platforms"
                        value={platform}
                        onChange={handleCheckboxChange}
                        className="form-checkbox h-5 w-5 text-fuchsia-600 rounded-full bg-slate-700 border-slate-600 focus:ring-fuchsia-500 neno-button shadow-xl hover:shadow-fuchsia-800/50"
                      />
                      <span className="text-sm">{platform}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Niche */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Required Niche(s)
              </label>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Technology",
                  "Fashion",
                  "Food",
                  "Travel",
                  "Gaming",
                  "Fitness",
                  "Lifestyle",
                ].map((niche) => (
                  <label
                    key={niche}
                    className="flex items-center space-x-2 cursor-pointer text-gray-400"
                  >
                    <input
                      type="checkbox"
                      name="requiredNiche"
                      value={niche}
                      onChange={handleCheckboxChange}
                      className="form-checkbox h-5 w-5 text-fuchsia-600 rounded-full bg-slate-700 border-slate-600 focus:ring-fuchsia-500 neno-button shadow-xl hover:shadow-fuchsia-800/50"
                    />
                    <span className="text-sm">{niche}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 text-white font-bold rounded-xl flex items-center justify-center space-x-2 neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 bg-fuchsia-800 border-fuchsia-800 transition-all duration-300"
              >
                <FaPlusCircle className="text-lg" />
                <span>Create Campaign</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCampaign;
