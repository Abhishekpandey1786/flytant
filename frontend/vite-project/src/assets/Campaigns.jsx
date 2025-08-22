import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaExternalLinkAlt, FaTag, FaBullhorn, FaUsers, FaPlusCircle } from 'react-icons/fa'; // FaPlusCircle icon import karein
import { useNavigate } from 'react-router-dom'; // useNavigate hook import karein

function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // useNavigate hook ka upyog karein

    // Campaigns fetch karne ka function
    const fetchCampaigns = async () => {
        // ... (Baaki code same rahega)
        try {
            const res = await axios.get('http://localhost:5000/api/campaigns/public');
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

    // Apply button ka handler
    const handleApply = async (campaignId) => {
        // ... (Baaki code same rahega)
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Please log in to apply for campaigns.");
                return;
            }

            await axios.post(
                `http://localhost:5000/api/campaigns/${campaignId}/apply`,
                {},
                {
                    headers: { 'x-auth-token': token }
                }
            );
            alert('Applied successfully!');
            fetchCampaigns();
        } catch (error) {
            console.error("Error applying:", error.response?.data?.msg || error.message);
            alert(error.response?.data?.msg || 'Failed to apply. You may have already applied.');
        }
    };

    const handleCreateCampaign = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to create a campaign.");
        } else {
            navigate('/create-campaign'); // CreateCampaign page par redirect karein
        }
    };

    if (loading) {
        return <div className="bg-slate-900 min-h-screen flex items-center justify-center text-gray-400">Loading campaigns...</div>;
    }

    return (
        <div className="bg-slate-900 min-h-screen text-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* ✅ Yahan par "Create Campaign" button jodein */}
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl font-extrabold text-white">
                        All Public Campaigns
                    </h2>
                    <button
                        onClick={handleCreateCampaign}
                        className="py-2 px-4 text-white font-semibold rounded-lg flex items-center space-x-2 bg-fuchsia-600 hover:bg-fuchsia-700 transition-colors"
                    >
                        <FaPlusCircle />
                        <span>Create Campaign</span>
                    </button>
                </div>
                
                {campaigns.length === 0 ? (
                    <p className="text-center text-gray-400">No public campaigns available yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {campaigns.map((campaign) => (
                            <div key={campaign._id} className="bg-slate-800 rounded-2xl shadow-xl border border-fuchsia-800 p-6 flex flex-col items-start transition-transform duration-300 hover:scale-105">
                                {/* ... baaki campaign card ka code same rahega */}
                                {campaign.imagePath && (
                                    <img
                                        src={`http://localhost:5000/${campaign.imagePath}`}
                                        alt={campaign.name}
                                        className="w-full h-48 object-cover rounded-xl mb-4"
                                    />
                                )}
                                <h3 className="text-2xl font-bold text-fuchsia-400 mb-2">{campaign.name}</h3>
                                <p className="text-sm text-gray-300 mb-4 flex-grow">{campaign.description}</p>
                                
                                <div className="w-full space-y-2 mt-auto">
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <FaBullhorn className="text-fuchsia-400" />
                                        <span className="font-semibold text-white">Platforms:</span> {campaign.platforms.join(', ')}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <FaTag className="text-fuchsia-400" />
                                        <span className="font-semibold text-white">Niches:</span> {campaign.requiredNiche.join(', ')}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <FaExternalLinkAlt className="text-fuchsia-400" />
                                        <span className="font-semibold text-white">CTA:</span> {campaign.cta || 'N/A'}
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => handleApply(campaign._id)}
                                    className="mt-4 w-full py-2 bg-fuchsia-600 text-white rounded-lg font-semibold hover:bg-fuchsia-700 transition-colors"
                                >
                                    Apply Now
                                </button>

                                {campaign.applicants && campaign.applicants.length > 0 && (
                                    <div className="mt-4 border-t border-slate-700 pt-4 w-full">
                                        <h4 className="text-md font-semibold text-gray-300 flex items-center gap-2 mb-2">
                                            <FaUsers className="text-fuchsia-400" /> Applicants ({campaign.applicants.length})
                                        </h4>
                                        <ul className="space-y-1">
                                            {campaign.applicants.map(applicant => (
                                                <li key={applicant._id} className="text-sm text-gray-400">
                                                    - {applicant.user.name}
                                                </li>
                                            ))}
                                        </ul>
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