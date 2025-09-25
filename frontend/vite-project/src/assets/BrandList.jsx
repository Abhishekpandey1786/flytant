import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaLink, FaIndustry, FaEnvelope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultLogo =
    "https://placehold.co/600x400/9333EA/FFFFFF?text=Brand+Image";

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/advertiser/brands");
        const processedData = res.data.map((brand) => ({
          ...brand,
          logo: brand.avatar
            ? `http://localhost:5000${brand.avatar}`
            : defaultLogo,
          bio: brand.bio || "No description available.",
        }));
        setBrands(processedData);
      } catch (err) {
        setError("⚠️ Failed to connect to the server. Please ensure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-14 h-14 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-purple-400 mt-4 text-lg">Loading brands...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-6 bg-red-900/40 rounded-xl shadow-md border border-red-700 ">
        <p className="text-xl font-semibold mb-2">Error Loading Brands</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 ">
      <motion.h2
        className="text-4xl font-extrabold mb-12 text-center bg-white bg-clip-text text-transparent "
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
         Our Top Brands
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 ">
        {brands.length > 0 ? (
          brands.map((brand) => (
            <motion.div
              key={brand._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gray-900/70 backdrop-blur-xl rounded-3xl border-2 overflow-hidden group neno-button shadow-xl hover:shadow-fuchsia-800/50  border-fuchsia-800  text-white font-semibold   transition"
            >
              {/* Full width cover image */}
              <motion.img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <div className="p-6">
                {/* Brand Name */}
                <h3 className="text-xl font-bold text-white mt-2 group-hover:text-white transition text-center">
                  {brand.name}
                </h3>

                {/* Location + Website */}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {brand.location && (
                    <span className="flex items-center gap-1 text-sm bg-purple-800/40 text-fuchsia-300 px-3 py-1 rounded-full">
                      <FaMapMarkerAlt size={14} /> {brand.location}
                    </span>
                  )}
                  {brand.website && (
                    <a
                      href={
                        brand.website.startsWith("http")
                          ? brand.website
                          : `https://${brand.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm bg-purple-800/40 text-fuchsia-300 px-3 py-1 rounded-full hover:bg-purple-700/50"
                    >
                      <FaLink size={14} /> Visit
                    </a>
                  )}
                </div>

                {/* Expandable Details */}
                <AnimatePresence>
                  {expanded === brand._id && (
                    <motion.div
                      className="mt-6 bg-gray-800/80 rounded-xl p-4 text-gray-300 text-sm space-y-3"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="flex items-center gap-2">
                        <FaEnvelope className="text-fuchsia-400" />{" "}
                        {brand.email || "Not provided"}
                      </p>
                      <p className="flex items-center gap-2">
                        <FaIndustry className="text-fuchsia-400" />{" "}
                        {brand.industry || "N/A"}
                      </p>
                    
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Button */}
                <button
                  onClick={() => toggleExpand(brand._id)}
                  className="mt-6 w-full py-2 bg-fuchsia-800 neno-button shadow-xl hover:shadow-fuchsia-800/50  hover:bg-fuchsia-800 border-fuchsia-800  text-white font-semibold rounded-full  hover:from-fuchsia-700 transition"
                >
                  {expanded === brand._id ? "Hide Details" : "View More"}
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400 text-lg">
            No brands registered yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandList;
