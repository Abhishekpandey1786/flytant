// src/components/BrandList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaLink,
  FaIndustry,
  FaEnvelope,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- theme tokens: original purple/fuchsia palette ---
const INK = "#0B0F19";                    // page bg, deep neutral dark
const CARD_BG = "rgba(17,24,39,0.7)";     // gray-900/70, same as before
const CARD_BORDER = "#86198F";            // fuchsia-800
const GLOW = "#D946EF";                   // fuchsia-500, spotlight glow
const ACCENT_TEXT = "#F0ABFC";            // fuchsia-300
const TAG_BG = "rgba(107,33,168,0.4)";    // purple-800/40
const PAPER = "#FFFFFF";
const MUTED = "#9CA3AF";                  // gray-400

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [curtainOpen, setCurtainOpen] = useState(false);

  const defaultLogo = `https://placehold.co/400x400/1a1d29/F0ABFC?text=Brand`;

  useEffect(() => {
    const id = "premiere-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get(
          "https://vistafluence.onrender.com/api/advertiser/brands"
        );

        const processedData = res.data.map((brand) => ({
          ...brand,
          logo:
            brand.avatar && brand.avatar.startsWith("http")
              ? brand.avatar
              : brand.avatar
              ? `https://vistafluence.onrender.com${brand.avatar}`
              : defaultLogo,
          bio: brand.bio || "No description available.",
        }));

        setBrands(processedData);
      } catch (err) {
        const errorMessage =
          err.response?.data?.msg ||
          "⚠️ Failed to connect to the server or fetch data.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        setTimeout(() => setCurtainOpen(true), 150);
      }
    };

    fetchBrands();
  }, []);

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  // --- Loading state ---
  if (isLoading) {
    return (
      <div
        className="flex flex-col justify-center items-center h-64"
        style={{ backgroundColor: INK }}
      >
        <div
          className="w-12 h-12 rounded-full animate-pulse"
          style={{
            boxShadow: `0 0 40px 6px ${GLOW}55`,
            border: `1px solid ${GLOW}88`,
          }}
        ></div>
        <p
          className="mt-5 text-sm tracking-wide"
          style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}
        >
          Lights coming up…
        </p>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div
        className="text-center p-6 rounded-xl border"
        style={{ backgroundColor: "#1f1113", borderColor: "#5C2A2A", color: "#E8A0A0" }}
      >
        <p className="text-xl font-semibold mb-2">Error loading brands</p>
        <p style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      className="relative px-4 py-20 overflow-hidden"
      style={{ backgroundColor: INK }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 900px 500px at 50% 0%, ${GLOW}14, transparent 60%)`,
        }}
      />

      <motion.div
        className="pointer-events-none absolute top-0 left-0 w-1/2 h-full z-30"
        style={{ backgroundColor: INK }}
        initial={{ x: "0%" }}
        animate={{ x: curtainOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.div
        className="pointer-events-none absolute top-0 right-0 w-1/2 h-full z-30"
        style={{ backgroundColor: INK }}
        initial={{ x: "0%" }}
        animate={{ x: curtainOpen ? "100%" : "0%" }}
        transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
      />

      <div className="container mx-auto relative z-10">
        <div className="max-w-xl mx-auto text-center mb-16">
          <h2
            className="text-4xl sm:text-5xl"
            style={{
              color: PAPER,
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
            }}
          >
            Brands in the spotlight
          </h2>
          <p
            className="mt-4 text-sm"
            style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}
          >
            Every partner currently casting for creators on Vistafluence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {brands.length > 0 ? (
            brands.map((brand, i) => {
              const isOpen = expanded === brand._id;
              return (
                <motion.div
                  key={brand._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + (i % 4) * 0.07 }}
                  className="group relative rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: CARD_BG,
                    backdropFilter: "blur(14px)",
                    border: `1px solid ${CARD_BORDER}55`,
                    borderTop: `1px solid ${GLOW}77`,
                  }}
                >
                  <div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none transition-opacity duration-500 opacity-40 group-hover:opacity-80"
                    style={{
                      background: `radial-gradient(circle, ${GLOW}33 0%, transparent 70%)`,
                    }}
                  />

                  <div className="relative pt-9 pb-6 px-5 text-center">
                    <motion.img
                      src={brand.logo}
                      alt={brand.name}
                      whileHover={{ y: -3 }}
                      className="w-16 h-16 mx-auto rounded-full object-cover relative z-10"
                      style={{
                        border: `1px solid ${GLOW}77`,
                        boxShadow: `0 0 24px 2px ${GLOW}33`,
                      }}
                    />
                    <div
                      className="w-12 h-4 mx-auto mt-1 rounded-full"
                      style={{
                        background: `radial-gradient(ellipse, ${GLOW}22, transparent 70%)`,
                      }}
                    />

                    <h3
                      className="mt-3 text-lg"
                      style={{
                        color: PAPER,
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 500,
                      }}
                    >
                      {brand.name}
                    </h3>

                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {brand.industry && (
                        <span
                          className="text-[11px] px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: TAG_BG,
                            color: ACCENT_TEXT,
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {brand.industry}
                        </span>
                      )}
                      {brand.location && (
                        <span
                          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
                          style={{
                            border: `1px solid ${CARD_BORDER}66`,
                            color: MUTED,
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          <FaMapMarkerAlt size={9} /> {brand.location}
                        </span>
                      )}
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="mt-4 pt-4 text-left space-y-2"
                            style={{ borderTop: `1px solid ${GLOW}33` }}
                          >
                            <p
                              className="flex items-center gap-2 text-xs"
                              style={{ color: PAPER, fontFamily: "'Inter', sans-serif" }}
                            >
                              <FaEnvelope size={11} style={{ color: ACCENT_TEXT }} />
                              {brand.email || "email not provided"}
                            </p>
                            {brand.website && (
                              <a
                                href={
                                  brand.website.startsWith("http")
                                    ? brand.website
                                    : `https://${brand.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs hover:underline"
                                style={{ color: PAPER, fontFamily: "'Inter', sans-serif" }}
                              >
                                <FaLink size={11} style={{ color: ACCENT_TEXT }} />
                                Visit website
                                <FaExternalLinkAlt size={9} style={{ opacity: 0.6 }} />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => toggleExpand(brand._id)}
                      className="mt-5 text-xs tracking-wide transition"
                      style={{
                        color: isOpen ? ACCENT_TEXT : MUTED,
                        fontFamily: "'Inter', sans-serif",
                        borderBottom: `1px solid ${isOpen ? ACCENT_TEXT : "transparent"}`,
                        paddingBottom: 2,
                      }}
                    >
                      {isOpen ? "Hide details" : "Details"}
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p
              className="col-span-full text-center text-lg"
              style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}
            >
              No brands registered yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandList;