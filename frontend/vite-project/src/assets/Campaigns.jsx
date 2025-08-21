import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCampaigns = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get('http://localhost:5000/api/campaigns', {
                    headers: { 'x-auth-token': token }
                });
                setCampaigns(res.data);
            } catch (err) {
                console.error("Error fetching campaigns:", err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, [navigate]);

    if (loading) return <div className="flex justify-center items-center h-screen text-gray-700">Loading campaigns...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">My Campaigns</h2>
                <button
                    onClick={() => navigate('/create-campaign')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow transition duration-300"
                >
                    + New Campaign
                </button>
            </div>

            {campaigns.length === 0 ? (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-md" role="alert">
                    <p className="font-semibold">No Campaigns Found</p>
                    <p>You have not created any campaigns yet. Click on "New Campaign" to get started!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {campaigns.map(campaign => (
                        <div
                            key={campaign._id}
                            className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-indigo-500 transition-transform transform hover:scale-[1.01]"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-indigo-700">{campaign.name}</h3>
                                <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                                    {campaign.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-gray-600 mt-2">{campaign.description}</p>
                            <div className="mt-4 text-sm text-gray-500 space-y-1">
                                <p><strong>Budget:</strong> ₹{campaign.budget}</p>
                                <p><strong>Platforms:</strong> {campaign.platforms.join(', ')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Campaigns;