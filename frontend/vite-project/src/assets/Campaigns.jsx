import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaExternalLinkAlt,
  FaTag,
  FaBullhorn,
  FaUsers,
  FaPlusCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user?._id;

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get("https://influezone.onrender.com/api/campaigns/public");
      setCampaigns(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleApply = async (campaignId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to apply for campaigns.");
      return;
    }

    // Subscription info
    const plan = user?.subscription?.plan || "Free";
    const maxApplications = user?.subscription?.maxApplications || 3; // Free users = 3

    const appliedCampaignsCount = campaigns.filter((c) =>
      c.applicants?.some((a) => a.user._id === currentUserId)
    ).length;

    if (appliedCampaignsCount >= maxApplications) {
      alert(
        `Your ${plan} plan allows only ${maxApplications} applications. Upgrade to apply more.`
      );
      navigate("/SubscriptionPlans");
      return;
    }

    try {
      await axios.post(
        `https://influezone.onrender.com/api/campaigns/${campaignId}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Applied successfully!");
      setCampaigns((prev) =>
        prev.map((c) =>
          c._id === campaignId
            ? {
                ...c,
                applicants: [
                  ...(c.applicants || []),
                  {
                    user: {
                      _id: currentUserId,
                      name: user.name,
                      email: user.email,
                      avatar: user.avatar,
                    },
                  },
                ],
              }
            : c
        )
      );
    } catch (error) {
      console.error("Error applying:", error.response?.data?.msg || error.message);
      alert(
        error.response?.data?.msg || "Failed to apply. You may have already applied."
      );
    }
  };

  const handleCreateCampaign = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to create a campaign.");
    } else {
      navigate("/create-campaign");
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center text-gray-400 text-center px-4">
        Loading campaigns...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white text-center sm:text-left">
            All Public Campaigns
          </h2>
          <button
            onClick={handleCreateCampaign}
            className="w-full sm:w-auto py-2 px-4 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 bg-fuchsia-600 hover:bg-fuchsia-700 transition-colors neno-button shadow-xl hover:shadow-fuchsia-800/50"
          >
            <FaPlusCircle />
            <span>Create Campaign</span>
          </button>
        </div>

        {campaigns.length === 0 ? (
          <p className="text-center text-gray-400 px-2">
            No public campaigns available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-slate-800 rounded-2xl shadow-xl border border-fuchsia-800 p-4 sm:p-6 flex flex-col items-start transition-transform duration-300 hover:scale-105 neno-button hover:shadow-fuchsia-800/50"
              >
                {campaign.imagePath && (
                  <img
                    src={`https://influezone.onrender.com/${campaign.imagePath}`}
                    alt={campaign.name}
                    className="w-full h-40 sm:h-48 object-cover rounded-xl mb-4 neno-button shadow-xl hover:shadow-fuchsia-800/50"
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

                {/* Apply Button with subscription check */}
                {campaign.createdBy._id !== currentUserId &&
                  user?.userType === "influencer" && (
                    <button
                      onClick={() => handleApply(campaign._id)}
                      className="mt-4 w-full py-2 bg-fuchsia-600 text-white rounded-lg font-semibold hover:bg-fuchsia-700 transition-colors active:scale-95 neno-button shadow-xl hover:shadow-fuchsia-800/50 border-fuchsia-800"
                    >
                      Apply Now
                    </button>
                  )}

                {campaign.applicants && campaign.applicants.length > 0 && (
                  <div className="mt-4 border-t border-slate-700 pt-4 w-full">
                    <h4 className="text-sm sm:text-md font-semibold text-gray-300 flex items-center gap-2 mb-2">
                      <FaUsers className="text-fuchsia-400" /> Applicants (
                      {campaign.applicants.length})
                    </h4>

                    {campaign.createdBy._id === currentUserId ? (
                      <ul className="space-y-2">
                        {campaign.applicants.map((applicant) => (
                          <li
                            key={applicant._id}
                            className="flex items-center gap-3 text-xs sm:text-sm text-gray-400 bg-slate-700 p-2 rounded-lg cursor-pointer hover:bg-slate-600"
                            onClick={() =>
                              navigate(
                                `/chats/campaign/${campaign._id}/user/${applicant.user._id}`
                              )
                            }
                          >
                            {applicant.user?.avatar ? (
                              <img
                                src={applicant.user.avatar}
                                alt={applicant.user.name}
                                className="w-8 h-8 rounded-full border border-gray-600"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-fuchsia-700 flex items-center justify-center text-white font-bold">
                                {applicant.user?.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-white text-xs sm:text-sm">
                                {applicant.user?.name}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-400">
                                {applicant.user?.email}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {campaign.applicants.length} people have applied.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Campaigns;
