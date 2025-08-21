import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateCampaign() {
    // Campaign form data state
    const [campaignData, setCampaignData] = useState({
        name: '',
        description: '',
        budget: '',
        platforms: [],
        requiredNiche: [],
        cta: '', // New field for Call to Action
        endDate: '', // New field for Campaign End Date
    });

    // State for image file and preview
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const navigate = useNavigate();

    // Define a list of common niches
    const niches = ['Technology', 'Fashion', 'Food', 'Travel', 'Gaming', 'Fitness', 'Lifestyle'];

    // Handle input field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCampaignData({ ...campaignData, [name]: value });
    };

    // Handle checkbox changes for platforms and niches
    const handleCheckboxChange = (e) => {
        const { name, value, checked } = e.target;
        setCampaignData(prevState => {
            const newArray = checked
                ? [...prevState[name], value]
                : prevState[name].filter(item => item !== value);
            return { ...prevState, [name]: newArray };
        });
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            // Create a local URL for image preview
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        // Prepare data for the API call
        const formData = new FormData();
        for (const key in campaignData) {
            if (Array.isArray(campaignData[key])) {
                campaignData[key].forEach(item => formData.append(key, item));
            } else {
                formData.append(key, campaignData[key]);
            }
        }
        if (image) {
            formData.append('image', image);
        }

        try {
            await axios.post('http://localhost:5000/api/campaigns', formData, {
                headers: { 
                    'x-auth-token': token,
                    // Note: 'Content-Type' is automatically set by browsers for FormData, 
                    // so you don't need to manually set it to 'application/json' anymore.
                }
            });
            alert('Campaign created successfully!');
            navigate('/campaigns');
        } catch (error) {
            console.error("Error creating campaign:", error.response?.data || error.message);
            alert('Failed to create campaign. Please try again.');
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 md:p-8">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-8 md:p-10 shadow-2xl rounded-xl border border-gray-200">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
                    Create a New Campaign ✨
                </h2>

                {/* Campaign Name */}
                <div className="mb-6">
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Campaign Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="e.g., Summer Sale 2025"
                        value={campaignData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        placeholder="Describe your campaign goals and requirements..."
                        value={campaignData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 shadow-sm"
                    ></textarea>
                </div>
                
                {/* Budget & End Date */}
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="w-full md:w-1/2">
                        <label htmlFor="budget" className="block text-gray-700 font-semibold mb-2">Budget (in ₹)</label>
                        <input
                            type="number"
                            name="budget"
                            id="budget"
                            placeholder="e.g., 50000"
                            value={campaignData.budget}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 shadow-sm"
                        />
                    </div>
                    <div className="w-full md:w-1/2">
                        <label htmlFor="endDate" className="block text-gray-700 font-semibold mb-2">Campaign End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            id="endDate"
                            value={campaignData.endDate}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 shadow-sm"
                        />
                    </div>
                </div>

                {/* Brand Image Upload */}
                <div className="mb-6">
                    <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">Brand Image / Logo</label>
                    <div className="flex items-center space-x-4">
                        <input
                            type="file"
                            name="image"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                        {imagePreview && (
                            <div className="flex-shrink-0">
                                <img src={imagePreview} alt="Image Preview" className="h-20 w-20 object-cover rounded-lg shadow-md" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Platforms Checkboxes */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Target Platforms</label>
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter'].map(platform => (
                            <label key={platform} className="flex items-center space-x-2 cursor-pointer text-gray-700">
                                <input
                                    type="checkbox"
                                    name="platforms"
                                    value={platform}
                                    onChange={handleCheckboxChange}
                                    className="form-checkbox h-5 w-5 text-indigo-600 rounded-full transition-colors duration-200"
                                />
                                <span className="text-sm">{platform}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Required Niche Checkboxes */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Required Niche(s)</label>
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {niches.map(niche => (
                            <label key={niche} className="flex items-center space-x-2 cursor-pointer text-gray-700">
                                <input
                                    type="checkbox"
                                    name="requiredNiche"
                                    value={niche}
                                    onChange={handleCheckboxChange}
                                    className="form-checkbox h-5 w-5 text-indigo-600 rounded-full transition-colors duration-200"
                                />
                                <span className="text-sm">{niche}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mb-8">
                    <label htmlFor="cta" className="block text-gray-700 font-semibold mb-2">Call to Action (Optional)</label>
                    <input
                        type="text"
                        name="cta"
                        id="cta"
                        placeholder="e.g., 'Click Here to Shop!'"
                        value={campaignData.cta}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full p-4 bg-indigo-600 text-white font-extrabold rounded-lg shadow-xl hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1"
                >
                    Create Campaign
                </button>
            </form>
        </div>
    );
}

export default CreateCampaign;