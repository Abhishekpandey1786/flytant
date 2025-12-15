import React, { useState, useEffect, useContext } from "react";
import {
    FaUser,
    FaEnvelope,
    FaBuilding,
    FaRegAddressCard,
    FaInstagram,
    FaYoutube,
    FaFacebook,
    FaEdit,
    FaSave,
    FaTimes,
    FaCreditCard, // New icon for subscription/credits
    FaEnvelopeOpenText, // New icon for DM credits
    FaCalendarAlt, // New icon for expiry date
    FaDollarSign, // New icon for budget
} from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { AuthContext } from "./AuthContext";
import imageCompression from "browser-image-compression";

// ... (resolveAvatarUrl and defaultAvatar remain the same)
const defaultAvatar =
    "https://placehold.co/150x150/5B21B6/ffffff?text=User";

const resolveAvatarUrl = (avatarPath) => {
    if (!avatarPath) return defaultAvatar;

    if (avatarPath.startsWith('http') || avatarPath.startsWith('https')) {
        return avatarPath;
    }

    // Assuming the base URL is correct if relative path is used
    return `https://vistafluence.onrender.com${avatarPath}`;
};


const Profile = () => {
    const { user, token, setUser } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);

    // Fetch Profile on Mount/Token change (Unchanged)
    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            setError("User not authenticated. Please log in.");
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch("https://vistafluence.onrender.com/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (res.ok) {
                    const fetchedUser = {
                        ...data.user,
                        // Ensure required fields are initialized for form editing
                        avatar: resolveAvatarUrl(data.user.avatar),
                        bio: data.user.bio || "",
                        description: data.user.description || "",
                        // Ensure all fields used in forms are present
                        instagram: data.user.instagram || "",
                        youtube: data.user.youtube || "",
                        facebook: data.user.facebook || "",
                        followers: data.user.followers || 0,
                        contactPerson: data.user.contactPerson || "",
                        industry: data.user.industry || "",
                        budget: data.user.budget || 0,
                    };
                    
                    setUser(fetchedUser);
                    setFormData(fetchedUser);
                } else {
                    setError(data.msg || "Failed to fetch user data.");
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
                setError("Failed to connect to the server.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    
    }, [token, setUser]); 

    // Handle Input Change (Unchanged)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Convert budget and followers to number if applicable
        const finalValue = (name === 'budget' || name === 'followers') ? Number(value) : value;
        setFormData({ ...formData, [name]: finalValue });
    };

    // Handle File Change (Unchanged)
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 800,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);
                setAvatarFile(compressedFile);
            } catch (err) {
                console.error("Image compression error:", err);
                toast.error("Failed to compress image");
            }
        }
    };

    // Handle Profile Update (Unchanged logic, ensures all formData fields are sent)
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Text Data Update
            const textUpdateResponse = await fetch(
                "https://vistafluence.onrender.com/api/users/me",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    // Send all data in formData. Server will filter allowed fields.
                    body: JSON.stringify(formData), 
                }
            );

            const textUpdateData = await textUpdateResponse.json();

            if (!textUpdateResponse.ok) {
                throw new Error(textUpdateData.msg || "Failed to update text data.");
            }

            
            let updatedUser = {
                ...textUpdateData.user,
                // Apply helper functions and default values again
                avatar: resolveAvatarUrl(textUpdateData.user.avatar),
                bio: textUpdateData.user.bio || "",
                description: textUpdateData.user.description || "",
                // Ensure all fields used in forms are present after update
                instagram: textUpdateData.user.instagram || "",
                youtube: textUpdateData.user.youtube || "",
                facebook: textUpdateData.user.facebook || "",
                followers: textUpdateData.user.followers || 0,
                contactPerson: textUpdateData.user.contactPerson || "",
                industry: textUpdateData.user.industry || "",
                budget: textUpdateData.user.budget || 0,
            };
            
            // 2. Avatar upload (if a new file was selected)
            if (avatarFile) {
                const avatarFormData = new FormData();
                avatarFormData.append("avatar", avatarFile);

                const avatarUpdateResponse = await fetch(
                    "https://vistafluence.onrender.com/api/users/me/avatar",
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: avatarFormData,
                    }
                );

                const avatarUpdateData = await avatarUpdateResponse.json();

                if (!avatarUpdateResponse.ok) {
                    throw new Error(
                        avatarUpdateData.msg || "Failed to upload avatar."
                    );
                }

                updatedUser = {
                    ...updatedUser,
                    avatar: resolveAvatarUrl(avatarUpdateData.user.avatar), // Use helper function
                };
            }

            
            setUser(updatedUser);
            setFormData(updatedUser);
            
            toast.success("Profile updated successfully! ✨");
            setIsEditing(false);
            setAvatarFile(null);
        } catch (err) {
            console.error("Profile update error:", err);
            setError(err.message || "An unexpected error occurred.");
            toast.error(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center p-4 sm:p-6 font-sans text-gray-100 neno-button hover:shadow-fuchsia-800/50 transition">
            <Toaster position="top-center" reverseOrder={false} />

            <div className="w-full max-w-4xl bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-2xl mt-6 sm:mt-10 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-6 sm:mb-8 text-white">
                    User Profile
                </h1>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-40 ">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-fuchsia-500 border-dotted rounded-full animate-spin mb-4 "></div>
                        <p className="ml-4 text-gray-400">Loading profile...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-400 p-4 bg-red-900 rounded-lg">
                        <p>{error}</p>
                    </div>
                )}

                {user && !isLoading && (
                    <div className="space-y-6 sm:space-y-8">
                        
                        {/* ======================================= */}
                        {/* 📝 EDITING MODE */}
                        {/* ======================================= */}
                        {isEditing ? (
                            <form onSubmit={handleProfileUpdate} className="space-y-6 sm:space-y-8">
                                
                                {/* Avatar and Name/Business Input */}
                                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 pb-6 border-b border-gray-600">
                                    {/* Avatar Upload (Unchanged) */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={
                                                avatarFile
                                                    ? URL.createObjectURL(avatarFile)
                                                    : formData.avatar
                                            }
                                            alt="User Avatar"
                                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 shadow-lg object-cover neno-button hover:shadow-fuchsia-800/50 border-fuchsia-800 transition"
                                        />
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute bottom-0 right-0 p-2 bg-fuchsia-600 rounded-full cursor-pointer hover:bg-fuchsia-700 transition "
                                        >
                                            <FaEdit className="text-white text-sm sm:text-base" />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <div className="w-full space-y-4">
                                        {/* Name / Business Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400">
                                                {user.userType === 'influencer' ? 'Name' : 'Business Name'}
                                            </label>
                                            <input
                                                type="text"
                                                name={user.userType === 'influencer' ? 'name' : 'businessName'}
                                                value={user.userType === 'influencer' ? (formData.name || "") : (formData.businessName || "")}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full bg-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
                                            />
                                        </div>
                                        {/* Bio / Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400">
                                                {user.userType === 'influencer' ? 'Bio (Short Description)' : 'Company Description'}
                                            </label>
                                            <textarea
                                                name={user.userType === 'influencer' ? 'bio' : 'description'}
                                                value={user.userType === 'influencer' ? (formData.bio || "") : (formData.description || "")}
                                                onChange={handleInputChange}
                                                rows="2"
                                                className="mt-1 block w-full bg-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Fields Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    {/* Influencer Specific Fields */}
                                    {user.userType === 'influencer' && (
                                        <>
                                            <InputField 
                                                label="Instagram Handle" 
                                                name="instagram" 
                                                value={formData.instagram} 
                                                onChange={handleInputChange} 
                                            />
                                            <InputField 
                                                label="YouTube Channel" 
                                                name="youtube" 
                                                value={formData.youtube} 
                                                onChange={handleInputChange} 
                                            />
                                            <InputField 
                                                label="Facebook Page" 
                                                name="facebook" 
                                                value={formData.facebook} 
                                                onChange={handleInputChange} 
                                            />
                                            <InputField 
                                                label="Total Followers" 
                                                name="followers" 
                                                type="number" 
                                                value={formData.followers} 
                                                onChange={handleInputChange} 
                                            />
                                        </>
                                    )}

                                    {/* Advertiser Specific Fields */}
                                    {user.userType === 'advertiser' && (
                                        <>
                                            <InputField 
                                                label="Contact Person" 
                                                name="contactPerson" 
                                                value={formData.contactPerson} 
                                                onChange={handleInputChange} 
                                            />
                                            <InputField 
                                                label="Industry/Niche" 
                                                name="industry" 
                                                value={formData.industry} 
                                                onChange={handleInputChange} 
                                            />
                                            <InputField 
                                                label="Budget ($)" 
                                                name="budget" 
                                                type="number" 
                                                value={formData.budget} 
                                                onChange={handleInputChange} 
                                            />
                                        </>
                                    )}
                                </div>


                                {/* Save/Cancel Buttons (Unchanged) */}
                                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-600">
                                    <button
                                        type="submit"
                                        className="px-5 sm:px-6 py-2 bg-fuchsia-600 text-white font-semibold rounded-full shadow-lg flex items-center justify-center space-x-2 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
                                    >
                                        <FaSave />
                                        <span>Save</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setAvatarFile(null); // Clear file preview on cancel
                                            setFormData(user); // Reset formData to current user state
                                        }}
                                        className="px-5 sm:px-6 py-2 bg-gray-600 text-white font-semibold rounded-full shadow-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2"
                                    >
                                        <FaTimes />
                                        <span>Cancel</span>
                                    </button>
                                </div>
                            </form>
                        ) : (
                        
                        /* ======================================= */
                        /* 📊 VIEW MODE */
                        /* ======================================= */
                            <>
                                {/* Profile Header (Unchanged) */}
                                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 pb-6 border-b border-gray-600 ">
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={formData.avatar || defaultAvatar} 
                                            alt="User Avatar"
                                            className="w-32 h-32 sm:w-32 sm:h-32 border-4 rounded-full shadow-lg object-cover neno-button hover:shadow-fuchsia-800/50 border-fuchsia-800 transition"
                                        />
                                    </div>
                                    {/* Name/Bio/Description */}
                                    <div className="text-center md:text-left flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold mb-1 capitalize text-gray-100">
                                            {user.name || user.businessName || "User"}
                                        </h2>
                                        <p className="text-fuchsia-400 break-all">{user.email}</p>
                                        <p className="mt-2 text-gray-400">
                                            {user.userType === "influencer"
                                                ? user.bio
                                                : user.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-center md:justify-end w-full md:w-auto">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-5 sm:px-6 py-2 bg-fuchsia-800 text-white font-semibold rounded-full shadow-lg transition flex items-center space-x-2 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 "
                                        >
                                            <FaEdit />
                                            <span>Edit Profile</span>
                                        </button>
                                    </div>
                                </div>

                                {/* ⭐️ NEW: SUBSCRIPTION STATUS CARD */}
                                {user.subscription && (
                                    <div className="bg-fuchsia-900/30 p-4 sm:p-6 rounded-xl shadow-lg border border-fuchsia-700/50">
                                        <h2 className="text-xl font-bold mb-4 flex items-center space-x-3 text-fuchsia-300">
                                            <FaCreditCard />
                                            <span>Subscription Status</span>
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-200">
                                            <InfoBox 
                                                icon={<FaCalendarAlt className="text-fuchsia-400" />}
                                                label="Plan"
                                                value={user.subscription.plan}
                                            />
                                            <InfoBox 
                                                icon={<FaEnvelopeOpenText className="text-fuchsia-400" />}
                                                label="DM Credits Left"
                                                value={user.subscription.dmCredits}
                                            />
                                            {user.subscription.expiryDate && (
                                                <InfoBox 
                                                    icon={<FaCalendarAlt className="text-fuchsia-400" />}
                                                    label="Expires"
                                                    value={formatDate(user.subscription.expiryDate)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Basic Info (Unchanged) */}
                                <div className="bg-gray-700 p-4 sm:p-6 rounded-xl shadow-inner border border-gray-600">
                                    <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">
                                        Basic Information
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3">
                                            <FaUser className="text-fuchsia-500" />
                                            <span className="font-medium capitalize">
                                                {user.name || user.businessName}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3 break-all">
                                            <FaEnvelope className="text-fuchsia-500" />
                                            <span>{user.email}</span>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center space-x-3">
                                                <FaRegAddressCard className="text-fuchsia-500" />
                                                <span>{user.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Influencer View (Unchanged) */}
                                {user.userType === "influencer" && (
                                    <div className="bg-gray-700 p-4 sm:p-6 rounded-xl shadow-inner border border-gray-600">
                                        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">
                                            Influencer Profile
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {user.instagram && (
                                                <div className="flex items-center space-x-3 break-all">
                                                    <FaInstagram className="text-fuchsia-500" />
                                                    <span>@{user.instagram}</span> {/* Added @ for clarity */}
                                                </div>
                                            )}
                                            {user.youtube && (
                                                <div className="flex items-center space-x-3 break-all">
                                                    <FaYoutube className="text-fuchsia-500" />
                                                    <span>{user.youtube}</span>
                                                </div>
                                            )}
                                            {user.facebook && (
                                                <div className="flex items-center space-x-3 break-all">
                                                    <FaFacebook className="text-fuchsia-500" />
                                                    <span>{user.facebook}</span>
                                                </div>
                                            )}
                                            {user.followers && (
                                                <div className="flex items-center space-x-3">
                                                    <FaUser className="text-fuchsia-500" />
                                                    <span>
                                                        Followers: {user.followers.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Advertiser View (Unchanged) */}
                                {user.userType === "advertiser" && (
                                    <div className="bg-gray-700 p-4 sm:p-6 rounded-xl shadow-inner border border-gray-600">
                                        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">
                                            Advertiser Profile
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {user.businessName && (
                                                <div className="flex items-center space-x-3">
                                                    <FaBuilding className="text-fuchsia-500" />
                                                    <span>{user.businessName}</span>
                                                </div>
                                            )}
                                            {user.contactPerson && (
                                                <div className="flex items-center space-x-3">
                                                    <FaRegAddressCard className="text-fuchsia-500" />
                                                    <span>Contact: {user.contactPerson}</span>
                                                </div>
                                            )}
                                            {user.industry && (
                                                <div className="flex items-center space-x-3">
                                                    <span>Industry: {user.industry}</span>
                                                </div>
                                            )}
                                            {user.budget && (
                                                <div className="flex items-center space-x-3">
                                                    <FaDollarSign className="text-fuchsia-500" />
                                                    <span>Budget: ${user.budget.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Helper Components ---

// Reusable input field for cleaner form JSX
const InputField = ({ label, name, value, onChange, type = "text" }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400">{label}</label>
        <input
            type={type}
            name={name}
            value={value || (type === 'number' ? 0 : "")}
            onChange={onChange}
            className="mt-1 block w-full bg-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
        />
    </div>
);

// Reusable info box for cleaner display JSX
const InfoBox = ({ icon, label, value }) => (
    <div className="flex flex-col p-3 bg-fuchsia-800/40 rounded-lg border border-fuchsia-600/50">
        <div className="flex items-center space-x-2 mb-1 text-sm font-medium text-fuchsia-300">
            {icon}
            <span>{label}</span>
        </div>
        <p className="text-lg font-bold text-white truncate">{value}</p>
    </div>
);


export default Profile;