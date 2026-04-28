import React, { useState, useEffect } from "react";
import { FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InfluencersList = () => {
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const defaultAvatar =
    "https://via.placeholder.com/150/5B21B6/FFFFFF?text=User";

    const getSocialLink = (platform, username) => {
    if (!username) return null;
    // Agar user ne poora URL daala hai toh wahi return karo, nahi toh base URL jodo
    if (username.startsWith("http")) return username;
    
    const baseUrls = {
      instagram: "https://instagram.com/",
      youtube: "https://youtube.com/",
      facebook: "https://facebook.com/",
    };
    return `${baseUrls[platform]}${username.replace("@", "")}`; // @ hatane ke liye fix
  };  

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const res = await axios.get(
          "https://vistafluence.onrender.com/api/users/influencers",
        );
        const data = res.data;

        const processedData = data.map((influencer) => ({
          ...influencer,

          avatar:
            influencer.avatar && influencer.avatar.startsWith("http")
              ? influencer.avatar
              : influencer.avatar
                ? `https://vistafluence.onrender.com${influencer.avatar}`
                : defaultAvatar,
          bio: influencer.bio || "No bio available.",
        }));
        setInfluencers(processedData);
      } catch (err) {
        console.error(
          "Influencers fetch error:",
          err.response?.data || err.message,
        );
        setError(
          err.response?.data?.msg ||
            "Server connection failed. Please check backend.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfluencers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-900 rounded-lg shadow-inner">
        <div className="w-12 h-12 md:w-16 md:h-16 border-t-4 border-b-4 border-fuchsia-500 rounded-full animate-spin mb-4"></div>
        <p className="text-lg md:text-xl font-medium text-fuchsia-400 text-center px-4">
          Fetching amazing influencers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4 md:p-6 bg-red-900 rounded-lg shadow-md border border-red-700">
        <p className="text-lg md:text-xl font-semibold mb-2">
          Error Loading Influencers!
        </p>
        <p className="text-sm md:text-base">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <motion.h2
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-10 md:mb-16 text-center bg-white bg-clip-text text-transparent drop-shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Meet Our Top Influencers
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-12"
        initial="hidden"
        animate="visible"
      >
        {influencers.length > 0 ? (
          influencers.map((influencer) => (
            <motion.div
              key={influencer._id}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="relative group rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-xl border shadow-xl md:shadow-2xl overflow-hidden transition-all duration-500 neno-button hover:shadow-fuchsia-800/50 text-white border-fuchsia-800"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500"></div>
              <div className="flex flex-col items-center p-6 md:p-8">
                <img
                  src={influencer.avatar}
                  alt={influencer.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-fuchsia-500 object-cover shadow-lg group-hover:shadow-fuchsia-500/60 transition-all duration-500"
                />
                <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-white capitalize group-hover:text-fuchsia-300 transition-colors text-center">
                  {influencer.name}
                </h3>
              </div>

              <div className="absolute inset-x-0 bottom-0 translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0 transition-all duration-500 bg-black/60 p-4 sm:p-6 flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="flex space-x-4 sm:space-x-5 text-white">
                  {influencer.instagram && (
                    <a
                      href={getSocialLink("instagram", influencer.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-pink-500 transition-transform hover:scale-125 p-1"
                    >
                      <FaInstagram size={24} />
                    </a>
                  )}
                   {influencer.youtube && (
                    <a
                      href={getSocialLink("youtube", influencer.youtube)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-red-500 transition-transform hover:scale-125 p-1"
                    >
                      <FaYoutube size={24} />
                    </a>
                  )}

                  {influencer.facebook && (
                    <a
                      href={getSocialLink("facebook", influencer.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-500 transition-transform hover:scale-125 p-1"
                    >
                      <FaFacebook size={24} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400 text-base sm:text-lg bg-gray-800 p-4 sm:p-6 rounded-xl">
            No influencers have joined yet. Be the first to shine! ✨
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default InfluencersList;
