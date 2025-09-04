// src/components/InfluencersList.jsx
import React, { useState, useEffect } from "react";
import { FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const InfluencersList = () => {
  const [influencers, setInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const defaultAvatar =
    "https://via.placeholder.com/150/5B21B6/FFFFFF?text=User";

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/influencers");
        const data = await res.json();

        if (res.ok) {
          const processedData = data.map((influencer) => ({
            ...influencer,
            avatar: influencer.avatar
              ? `http://localhost:5000${influencer.avatar}`
              : defaultAvatar,
            bio: influencer.bio || "No bio available.",
          }));
          setInfluencers(processedData);
        } else {
          setError(data.msg || "Failed to fetch influencers.");
        }
      } catch (err) {
        console.error("Influencers fetch error:", err);
        setError(
          "Failed to connect to the server. Please ensure the backend is running."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfluencers();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const handleChatClick = (id) => {
    navigate(`/influencer/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-900 rounded-lg shadow-inner">
        <div className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium text-purple-400">
          Fetching amazing influencers...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-6 bg-red-900 rounded-lg shadow-md border border-red-700">
        <p className="text-xl font-semibold mb-2">Error Loading Influencers!</p>
        <p>{error}</p>
        <p className="text-sm mt-3">
          Please check your network connection or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2
        className="text-3xl md:text-4xl font-extrabold mb-10 text-center text-white leading-tight"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <span className="bg-clip-text hover:shadow-fuchsia-800/50 text-white">
          Top Influencers
        </span>
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {influencers.length > 0 ? (
          influencers.map((influencer) => (
            <motion.div
              key={influencer._id}
              className="relative bg-gray-800 p-6 sm:p-8 rounded-3xl border
                         transform hover:scale-105 
                         transition-all duration-400 ease-in-out group neno-button shadow-xl hover:shadow-fuchsia-800/50 border-fuchsia-800"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="flex flex-col items-center text-center z-10 relative">
                <div className="relative mb-4 md:mb-6">
                  <img
                    src={influencer.avatar}
                    alt={influencer.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-fuchsia-600 object-cover 
                                 shadow-lg transition-all duration-300 group-hover:border-fuchsia-400 group-hover:shadow-fuchsia-500/30"
                  />
                </div>

                <h3 className="text-lg md:text-2xl font-bold text-white mb-2 capitalize group-hover:text-purple-300 transition-colors duration-300">
                  {influencer.name}
                </h3>
               

                <div className="flex justify-center space-x-3 md:space-x-4 text-purple-500 mt-2 md:mt-3">
                  {influencer.instagram && (
                    <a
                      href={`https://instagram.com/${influencer.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-fuchsia-300 transform hover:-translate-y-1 transition-all duration-200"
                      title="Instagram Profile"
                    >
                      <FaInstagram size={22} className="md:w-7 md:h-7" />
                    </a>
                  )}
                  {influencer.youtube && (
                    <a
                      href={`https://youtube.com/${influencer.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-fuchsia-300 transform hover:-translate-y-1 transition-all duration-200"
                      title="YouTube Channel"
                    >
                      <FaYoutube size={22} className="md:w-7 md:h-7" />
                    </a>
                  )}
                  {influencer.facebook && (
                    <a
                      href={`https://facebook.com/${influencer.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-fuchsia-300 transform hover:-translate-y-1 transition-all duration-200"
                      title="Facebook Page"
                    >
                      <FaFacebook size={22} className="md:w-7 md:h-7" />
                    </a>
                  )}
                </div>
                <button
                  
                  className="mt-6 md:mt-8 px-4 py-2 md:px-6 md:py-3 bg-fuchsia-700 text-white font-semibold rounded-full 
                             neno-button shadow-xl hover:shadow-fuchsia-800/50 border-fuchsia-800
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 text-sm md:text-base"
                >
                  View more
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400 text-lg md:text-xl p-6 md:p-8 bg-gray-800 rounded-lg shadow-inner">
            No influencers have created their profiles yet. <br /> Be the first
            to join our community!
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default InfluencersList;
