import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  FaExternalLinkAlt,
  FaTag,
  FaBullhorn,
  FaUsers,
  FaPlusCircle,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaEnvelope,
  FaTimesCircle, // New icon for rejection
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { AuthContext } from './AuthContext';

const resolveAssetUrl = (assetPath) => {
  if (!assetPath) return null;
  if (assetPath.startsWith('http') || assetPath.startsWith('https')) {
    return assetPath;
  }
  return `https://vistafluence.onrender.com/${assetPath}`;
};

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { user, token, updateUserSubscription } = useContext(AuthContext);
  const currentUserId = user?._id;

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get("https://vistafluence.onrender.com/api/campaigns/public");

      const updatedCampaigns = res.data.map(campaign => ({
        ...campaign,
        imagePath: resolveAssetUrl(campaign.imagePath),
        applicants: campaign.applicants?.map(applicant => ({
          ...applicant,
          user: applicant.user ? {
            ...applicant.user,
            avatar: resolveAssetUrl(applicant.user.avatar),
          } : applicant.user,
        }))
      }));

      setCampaigns(updatedCampaigns);
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
    if (!token) {
      alert("Please log in to apply for campaigns.");
      return;
    }

    if (user?.userType !== 'influencer') {
      alert("Only influencers can apply to campaigns.");
      return;
    }

    const userSubscription = user?.subscription;
    const userPlan = userSubscription?.plan || "Free";
    const maxApplications = userSubscription?.maxApplications || 3;
    const applicationsMade = userSubscription?.applications_made_this_month || 0;

    if (applicationsMade >= maxApplications && maxApplications < 9999) {
      alert(
        `Your ${userPlan} plan allows only ${maxApplications} applications this month. Please upgrade to apply more.`
      );
      navigate("/SubscriptionPlans");
      return;
    }

    try {
      const response = await axios.post(
        `https://vistafluence.onrender.com/api/campaigns/${campaignId}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Applied successfully! 🎉");
      updateUserSubscription({
        applications_made_this_month: response.data.newApplicationCount,
        maxApplications: response.data.newMaxApplications
      });

      fetchCampaigns();

    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Failed to apply. An error occurred.";
      if (error.response?.status === 403 && error.response?.data?.redirect === '/SubscriptionPlans') {
        alert(errorMsg);
        navigate("/SubscriptionPlans");
        return;
      }

      console.error("Error applying:", errorMsg);
      alert(errorMsg);
    }
  };

  const handleCreateCampaign = () => {
    if (!token) {
      alert("Please log in to create a campaign.");
    } else {
      if (user?.userType === "advertiser") {
        navigate("/create-campaign");
      } else {
        alert("Only advertisers can create campaigns.");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center text-gray-400 text-center px-4">
        <div className="w-10 h-10 border-4 border-fuchsia-500 border-dotted rounded-full animate-spin"></div>
        <p className="ml-4">Loading campaigns...</p>
      </div>
    );
  }

  const userSubscription = user?.subscription;
  const isInfluencer = user?.userType === 'influencer';
  const planName = userSubscription?.plan || "Free";
  const appsMade = userSubscription?.applications_made_this_month || 0;
  const maxApps = userSubscription?.maxApplications || 3;

  const isLimitReached = appsMade >= maxApps && maxApps < 9999;
  const maxAppsDisplay = maxApps >= 9999 ? 'Unlimited' : maxApps;

  return (
    <div className="bg-slate-900 min-h-screen text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {isInfluencer && (
          <div className="bg-fuchsia-800/20 p-4 rounded-xl mb-6 border border-fuchsia-700 shadow-lg">
            <p className="text-white font-semibold">
              Your Plan: <span className="text-fuchsia-400">{planName}</span> ({userSubscription?.status || 'Inactive'})
            </p>
            <p className="text-sm text-gray-300 mt-1 flex items-center flex-wrap">
              Applications Used: <span className="font-bold ml-1">{appsMade}</span> / <span className="font-bold mr-2">{maxAppsDisplay}</span> this month.
              {isLimitReached && (
                <span className="text-red-400 font-bold"> (Limit Reached!)</span>
              )}
              <span
                className="ml-4 cursor-pointer text-fuchsia-300 hover:text-fuchsia-100 font-medium"
                onClick={() => navigate("/SubscriptionPlans")}
              >
                Upgrade Plan &gt;
              </span>
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white text-center sm:text-left">
            {user?.userType === "advertiser" ? "My Campaigns" : "All Public Campaigns"}
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
            {campaigns
              .filter((campaign) => {
                if (user?.userType === "advertiser") {
                  return campaign.createdBy?._id === currentUserId;
                }
                return true;
              })
              .map((campaign) => {
                const hasApplied = campaign.applicants?.some(
                  (a) => a.user?._id === currentUserId
                );

                return (
                  <div
                    key={campaign._id}
                    className="relative bg-slate-800 rounded-2xl shadow-xl border border-fuchsia-800 p-4 sm:p-6 flex flex-col items-start transition-all duration-300 hover:scale-105 neno-button hover:shadow-fuchsia-800/50 overflow-visible"
                  >
                    {/* REJECTION ALERT FOR ADVERTISER (BRAND) */}
                    {user?.userType === "advertiser" && campaign.status === "rejected" && (
                      <div className="w-full bg-red-950/40 border border-red-600/50 p-3 rounded-xl mb-4 animate-pulse">
                        <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                          <FaTimesCircle /> Rejected by Admin
                        </div>
                        {campaign.feedback && (
                          <p className="text-gray-300 text-xs mt-1 italic">
                            Reason: "{campaign.feedback}"
                          </p>
                        )}
                      </div>
                    )}

                    {campaign.imagePath && (
                      <img
                        src={campaign.imagePath}
                        alt={campaign.name}
                        className="w-full h-40 sm:h-48 object-cover rounded-xl mb-4 neno-button shadow-xl"
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
                        <span className="font-semibold text-white">Budget:</span> ₹
                        {campaign.budget?.toLocaleString() || 0}
                      </p>
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

                    {campaign.createdBy?._id !== currentUserId &&
                      isInfluencer && (
                        <button
                          onClick={() => handleApply(campaign._id)}
                          disabled={hasApplied || isLimitReached}
                          className={`mt-4 w-full py-2 text-white rounded-lg font-semibold transition-colors active:scale-95 neno-button shadow-xl border-fuchsia-800 ${
                            hasApplied || isLimitReached
                              ? "bg-gray-500 cursor-not-allowed"
                              : "bg-fuchsia-600 hover:bg-fuchsia-700"
                          }`}
                        >
                          {hasApplied ? "Applied" : isLimitReached ? "Limit Reached (Upgrade)" : "Apply Now"}
                        </button>
                      )}

                    {campaign.applicants && campaign.applicants.length > 0 && (
                      <div className="mt-4 border-t border-slate-700 pt-4 w-full">
                        <h4 className="text-sm sm:text-md font-semibold text-gray-300 flex items-center gap-2 mb-2">
                          <FaUsers className="text-fuchsia-400" /> Applicants (
                          {campaign.applicants.length})
                        </h4>
                        {campaign.createdBy?._id === currentUserId ? (
                          <ul className="space-y-2">
                            {campaign.applicants.map((applicant) =>
                              applicant.user ? (
                                <li
                                  key={applicant.user._id}
                                  className="group relative flex items-center gap-3 text-xs sm:text-sm text-gray-400 bg-slate-700 p-2 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                                  onClick={() =>
                                    navigate(
                                      `/chats/campaign/${campaign._id}/user/${applicant.user._id}`
                                    )
                                  }
                                >
                                  {/* --- PROFILE HOVER CARD --- */}
                                  <div 
                                    className="absolute left-1/2 -translate-x-1/2 bottom-full pb-4 hidden group-hover:flex flex-col items-center w-64 z-[100] transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                                  >
                                    <div className="bg-slate-900 border border-fuchsia-500 rounded-xl p-4 shadow-[0_0_20px_rgba(217,70,239,0.5)] w-full">
                                      <div className="flex flex-col items-center text-center">
                                        {applicant.user.avatar ? (
                                          <img src={applicant.user.avatar} className="w-16 h-16 rounded-full border-2 border-fuchsia-500 object-cover mb-2" alt="avatar" />
                                        ) : (
                                          <div className="w-16 h-16 rounded-full bg-fuchsia-700 flex items-center justify-center text-white text-xl font-bold mb-2">
                                            {applicant.user.name?.[0]?.toUpperCase()}
                                          </div>
                                        )}
                                        <h5 className="text-white font-bold text-lg">{applicant.user.name}</h5>
                                        <p className="text-gray-400 text-[10px] mb-3 flex items-center gap-1 justify-center">
                                          <FaEnvelope className="text-fuchsia-400" /> {applicant.user.email}
                                        </p>
                                        
                                        <div className="w-full border-t border-slate-700 pt-3 flex justify-around">
                                          <a 
                                            href={`${applicant.user.instagram || ''}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-1 hover:scale-125 transition-transform p-1"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <FaInstagram className="text-pink-500 text-xl" />
                                            <span className="text-[10px] text-fuchsia-300 font-bold underline italic">Visit</span>
                                          </a>

                                          <a 
                                            href={`${applicant.user.facebook || ''}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-1 hover:scale-125 transition-transform p-1"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <FaFacebook className="text-blue-500 text-xl" />
                                            <span className="text-[10px] text-fuchsia-300 font-bold underline italic">Visit</span>
                                          </a>

                                          <a 
                                            href={applicant.user.youtube?.startsWith('http') ? applicant.user.youtube : `${applicant.user.youtube || ''}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-1 hover:scale-125 transition-transform p-1"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <FaYoutube className="text-red-500 text-xl" />
                                            <span className="text-[10px] text-fuchsia-300 font-bold underline italic">Visit</span>
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%-16px)] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-fuchsia-500"></div>
                                  </div>

                                  {applicant.user.avatar ? (
                                    <img
                                      src={applicant.user.avatar}
                                      alt={applicant.user.name}
                                      className="w-8 h-8 rounded-full border border-gray-600 object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-fuchsia-700 flex items-center justify-center text-white font-bold text-sm">
                                      {applicant.user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-white text-xs sm:text-sm font-medium">
                                      {applicant.user.name}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 break-all">
                                      {applicant.user.email}
                                    </p>
                                  </div>
                                </li>
                              ) : null
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-xs sm:text-sm">
                            {campaign.applicants.length} people have applied.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Campaigns;