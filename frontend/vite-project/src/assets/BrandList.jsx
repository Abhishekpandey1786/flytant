import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaLink } from "react-icons/fa";
import { motion } from "framer-motion";

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const defaultLogo =
    "https://placehold.co/150x150/5B21B6/FFFFFF?text=Brand";

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
        console.error("Brands fetch error:", err);
        setError("Failed to connect to the server. Please ensure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-900 rounded-lg shadow-inner">
        <div className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium text-purple-400">Fetching amazing brands...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-6 bg-red-900 rounded-lg shadow-md border border-red-700">
        <p className="text-xl font-semibold mb-2">Error Loading Brands!</p>
        <p>{error}</p>
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
        <span className="bg-clip-text text-transparent bg-white">
          Top Brands
        </span>
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {brands.length > 0 ? (
          brands.map((brand) => (
            <motion.div
              key={brand._id}
              className="relative bg-gray-800 p-6 sm:p-8 rounded-3xl transform hover:scale-105 duration-400 ease-in-out group shadow-xl hover:shadow-fuchsia-800/50 neno-button text-white border-2 border-fuchsia-800 transition"
              variants={itemVariants}
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl shadow-xl border-2 border-fuchsia-800 hover:shadow-fuchsia-800/50 transition"
                />
                <h3 className="text-xl md:text-2xl font-bold text-white mt-4 capitalize">
                  {brand.name}
                </h3>
                

                <div className="flex flex-wrap justify-center gap-3 text-purple-500 mt-3">
                  {brand.location && (
                    <div className="flex items-center space-x-1 text-sm md:text-base">
                      <FaMapMarkerAlt size={16} className="text-fuchsia-400" />
                      <span className="text-gray-400">{brand.location}</span>
                    </div>
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
                      className="hover:text-fuchsia-300 text-sm md:text-base"
                    >
                      <FaLink size={16} />
                    </a>
                  )}
                </div>

                {expanded === brand._id && (
                  <div className="mt-6 p-4 bg-gray-700 rounded-lg text-gray-300 text-xs md:text-sm space-y-2 w-full">
                    <p><strong>Email:</strong> {brand.email || "Not provided"}</p>
                    <p><strong>Industry:</strong> {brand.industry || "N/A"}</p>
                  </div>
                )}

                <button
                  onClick={() => toggleExpand(brand._id)}
                  className="mt-6 px-4 py-2 md:px-5 md:py-2 bg-fuchsia-700 text-white font-semibold rounded-full shadow-md neno-button hover:shadow-fuchsia-800/50 border-2 hover:bg-fuchsia-800 border-fuchsia-800 transition text-sm md:text-base"
                >
                  {expanded === brand._id ? "Show Less" : "View More"}
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400 text-lg md:text-xl p-6 md:p-8 bg-gray-800 rounded-lg shadow-inner">
            No brands have created their profiles yet.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default BrandList;
