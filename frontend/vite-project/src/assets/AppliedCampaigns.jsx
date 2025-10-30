import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBullhorn, FaTag, FaExternalLinkAlt } from "react-icons/fa";

function AppliedCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppliedCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "https://vistafluence.onrender.com/api/applied/applied",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCampaigns(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching applied campaigns:", error);
        setLoading(false);
      }
    };

    fetchAppliedCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center text-gray-400 text-center px-4">
        Loading applied campaigns...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen text-gray-100 p-4 sm:p-6 md:p-8 ">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-6 sm:mb-10 text-center md:text-left">
          My Applied Campaigns
        </h2>

        {campaigns.length === 0 ? (
          <p className="text-center text-gray-400 px-2">
            You have not applied for any campaigns yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-slate-800 rounded-2xl  p-4 sm:p-6 flex flex-col items-start  duration-300 hover:scale-105 neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white border-2 border-fuchsia-800 transition"
              >
                {campaign.imagePath && (
                  <img
                    src={`https://vistafluence.onrender.com${campaign.imagePath}`}
                    alt={campaign.name}
                    className="w-full h-40 sm:h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {campaign.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mb-4 flex-grow">
                  {campaign.description}
                </p>
                <div className="w-full space-y-2 mt-auto">
                  <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                    <FaBullhorn className="text-fuchsia-400" />
                    <span className="font-semibold text-white">Platforms:</span>{" "}
                    {campaign.platforms.join(", ")}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                    <FaTag className="text-fuchsia-400" />
                    <span className="font-semibold text-white">Niches:</span>{" "}
                    {campaign.requiredNiche.join(", ")}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                    <FaExternalLinkAlt className="text-fuchsia-400" />
                    <span className="font-semibold text-white">CTA:</span>{" "}
                    {campaign.cta || "N/A"}
                  </p>
                </div>
                <div className="mt-4 w-full">
                  <h4 className="text-sm sm:text-md font-semibold text-gray-300">
                    Application Status:{" "}
                    <span className="text-fuchsia-400">Applied</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Your application is being reviewed by the brand.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppliedCampaigns;
