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
  FaCreditCard, 
  FaCalendarAlt, 
  FaDollarSign, 
} from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { AuthContext } from "./AuthContext";
import imageCompression from "browser-image-compression";

const defaultAvatar = "https://placehold.co/150x150/5B21B6/ffffff?text=User";

const resolveAvatarUrl = (avatarPath) => {
  if (!avatarPath) return defaultAvatar;
  let url = avatarPath.startsWith("http") ? avatarPath : `https://vistafluence.onrender.com${avatarPath}`;
  if (url.includes("cloudinary.com")) {
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_300,h_300,c_fill/");
  }
  return url;
};

const Profile = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false); // New state for direct upload
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError("User not authenticated. Please log in.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          "https://vistafluence.onrender.com/api/users/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (res.ok) {
          const fetchedUser = {
            ...data.user,
            avatar: resolveAvatarUrl(data.user.avatar),
            bio: data.user.bio || "",
            description: data.user.description || "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === "budget" || name === "followers" ? Number(value) : value;
    setFormData({ ...formData, [name]: finalValue });
  };

  // Direct Avatar Upload Handler
  const handleDirectAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);

      const avatarFormData = new FormData();
      avatarFormData.append("avatar", compressedFile);

      const res = await fetch("https://vistafluence.onrender.com/api/users/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: avatarFormData,
      });

      const data = await res.json();

      if (res.ok) {
        const newAvatarUrl = resolveAvatarUrl(data.user.avatar);
        setUser({ ...user, avatar: newAvatarUrl });
        setFormData({ ...formData, avatar: newAvatarUrl });
        toast.success("Profile picture updated! ✨");
      } else {
        throw new Error(data.msg || "Failed to upload avatar.");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred during upload.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        setAvatarFile(compressedFile);
      } catch (err) {
        console.error("Image compression error:", err);
        toast.error("Failed to compress image");
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const textUpdateResponse = await fetch(
        "https://vistafluence.onrender.com/api/users/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const textUpdateData = await textUpdateResponse.json();

      if (!textUpdateResponse.ok) {
        throw new Error(textUpdateData.msg || "Failed to update text data.");
      }

      let updatedUser = {
        ...textUpdateData.user,
        avatar: resolveAvatarUrl(textUpdateData.user.avatar),
        bio: textUpdateData.user.bio || "",
        description: textUpdateData.user.description || "",
        instagram: textUpdateData.user.instagram || "",
        youtube: textUpdateData.user.youtube || "",
        facebook: textUpdateData.user.facebook || "",
        followers: textUpdateData.user.followers || 0,
        contactPerson: textUpdateData.user.contactPerson || "",
        industry: textUpdateData.user.industry || "",
        budget: textUpdateData.user.budget || 0,
      };

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

        if (avatarUpdateResponse.ok) {
          updatedUser.avatar = resolveAvatarUrl(avatarUpdateData.user.avatar);
        }
      }

      setUser(updatedUser);
      setFormData(updatedUser);
      toast.success("Profile updated successfully! ✨");
      setIsEditing(false);
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center p-4 sm:p-6 font-sans text-gray-100 transition">
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
            
            {/* --- SHARED AVATAR SECTION (Direct Upload Enabled) --- */}
            <div className="flex flex-col items-center pb-6 border-b border-gray-600">
              <div className="relative group flex-shrink-0">
                <img
                  src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar}
                  alt="User Avatar"
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 shadow-lg object-cover neno-button hover:shadow-fuchsia-800/50 border-fuchsia-800 transition ${isUploadingAvatar ? 'opacity-50' : 'opacity-100'}`}
                />
                
                {/* Upload Overlay */}
                <label
                  htmlFor="direct-avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300"
                >
                  <div className="text-center">
                    <FaEdit className="text-white text-xl mx-auto mb-1" />
                    <span className="text-xs text-white font-bold">Update Photo</span>
                  </div>
                  <input
                    id="direct-avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleDirectAvatarUpload}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </label>

                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {!isEditing && (
                <div className="text-center mt-4">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1 capitalize text-gray-100">
                    {user.name || user.businessName || "User"}
                  </h2>
                  <p className="text-fuchsia-400 break-all">{user.email}</p>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6 sm:space-y-8">
                <div className="w-full space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      {user.userType === "influencer" ? "Name" : "Business Name"}
                    </label>
                    <input
                      type="text"
                      name={user.userType === "influencer" ? "name" : "businessName"}
                      value={user.userType === "influencer" ? formData.name || "" : formData.businessName || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full bg-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      {user.userType === "influencer" ? "Bio (Short Description)" : "Company Description"}
                    </label>
                    <textarea
                      name={user.userType === "influencer" ? "bio" : "description"}
                      value={user.userType === "influencer" ? formData.bio || "" : formData.description || ""}
                      onChange={handleInputChange}
                      rows="2"
                      className="mt-1 block w-full bg-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.userType === "influencer" && (
                    <>
                      <InputField label="Instagram Handle" name="instagram" value={formData.instagram} onChange={handleInputChange} />
                      <InputField label="YouTube Channel" name="youtube" value={formData.youtube} onChange={handleInputChange} />
                      <InputField label="Facebook Page" name="facebook" value={formData.facebook} onChange={handleInputChange} />
                      <InputField label="Total Followers" name="followers" type="number" value={formData.followers} onChange={handleInputChange} />
                    </>
                  )}

                  {user.userType === "advertiser" && (
                    <>
                      <InputField label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} />
                      <InputField label="Industry/Niche" name="industry" value={formData.industry} onChange={handleInputChange} />
                      <InputField label="Budget ₹" name="budget" type="number" value={formData.budget} onChange={handleInputChange} />
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-600">
                  <button type="submit" className="px-5 sm:px-6 py-2 bg-fuchsia-600 text-white font-semibold rounded-full shadow-lg flex items-center justify-center space-x-2 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition">
                    <FaSave /> <span>Save Profile Info</span>
                  </button>
                  <button type="button" onClick={() => { setIsEditing(false); setFormData(user); }} className="px-5 sm:px-6 py-2 bg-gray-600 text-white font-semibold rounded-full shadow-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2">
                    <FaTimes /> <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-center md:justify-end w-full">
                  <button onClick={() => setIsEditing(true)} className="px-5 sm:px-6 py-2 bg-fuchsia-800 text-white font-semibold rounded-full shadow-lg transition flex items-center space-x-2 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 ">
                    <FaEdit /> <span>Edit Profile Text</span>
                  </button>
                </div>
                
                <p className="text-center text-gray-400">
                  {user.userType === "influencer" ? user.bio : user.description}
                </p>

                {user.subscription && user.userType === "influencer" && (
                  <div className="bg-fuchsia-700/30 p-4 sm:p-6 rounded-xl shadow-lg border border-fuchsia-700/30">
                    <h2 className="text-xl font-bold mb-4 flex items-center space-x-3 text-white">
                      <FaCreditCard /> <span>Subscription Status</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-200">
                      <InfoBox icon={<FaCalendarAlt className="text-white" />} label="Plan" value={user.subscription.plan} />
                      {user.subscription.expiryDate && (
                        <InfoBox icon={<FaCalendarAlt className="text-white" />} label="Expires" value={formatDate(user.subscription.expiryDate)} />
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-700 p-4 sm:p-6 rounded-xl shadow-inner border border-gray-600">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Basic Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-fuchsia-500" />
                      <span className="font-medium capitalize">{user.name || user.businessName}</span>
                    </div>
                    <div className="flex items-center space-x-3 break-all">
                      <FaEnvelope className="text-fuchsia-500" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Influencer/Advertiser Details Sections (Unchanged) */}
                {user.userType === "influencer" && (
                   <div className="bg-gray-700 p-4 sm:p-6 rounded-xl shadow-inner border border-gray-600">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Influencer Profile</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.instagram && <div className="flex items-center space-x-3 break-all"><FaInstagram className="text-fuchsia-500" /><span>@{user.instagram}</span></div>}
                      {user.followers && <div className="flex items-center space-x-3"><FaUser className="text-fuchsia-500" /><span>Followers: {user.followers.toLocaleString()}</span></div>}
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

// ... (InputField and InfoBox components remain same as your code)
const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
    <input
      id={name} 
      type={type}
      name={name}
      value={value || (type === "number" ? 0 : "")}
      onChange={onChange}
      className="mt-1 block w-full bg-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 neno-button hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
    />
  </div>
);

const InfoBox = ({ icon, label, value }) => (
  <div className="flex flex-col p-3 bg-fuchsia-800/40 rounded-lg border border-fuchsia-600/50">
    <div className="flex items-center space-x-2 mb-1 text-sm font-medium text-fuchsia-300">{icon}<span>{label}</span></div>
    <p className="text-lg font-bold text-white truncate">{value}</p>
  </div>
);

export default Profile;