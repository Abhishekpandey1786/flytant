import React, { useState, useEffect, useContext } from "react";
import {
  FaUser, FaEnvelope, FaBuilding, FaRegAddressCard, FaInstagram,
  FaYoutube, FaFacebook, FaEdit, FaSave, FaTimes, FaCreditCard,
  FaEnvelopeOpenText, FaCalendarAlt, FaDollarSign,
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
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  // Preview URL state to avoid memory leaks
  const [previewUrl, setPreviewUrl] = useState(null);

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

  // Cleanup Preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Fix: Allow empty string so user can delete numbers without it jumping to 0 immediately
    const finalValue =
      (name === "budget" || name === "followers") && value !== "" 
        ? Number(value) 
        : value;
    setFormData({ ...formData, [name]: finalValue });
  };

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
        
        // Update local preview immediately
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(compressedFile));
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
      // 1. Text Update
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

      // Start building updated user object
      let currentUpdatedUser = {
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

      // 2. Avatar Update (Only if a new file was picked)
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
          currentUpdatedUser.avatar = resolveAvatarUrl(avatarUpdateData.user.avatar);
        } else {
          toast.error("Profile saved, but image upload failed.");
        }
      }

      setUser(currentUpdatedUser);
      setFormData(currentUpdatedUser);

      toast.success("Profile updated successfully! ✨");
      setIsEditing(false);
      setAvatarFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Profile update error:", err);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center p-4 sm:p-6 font-sans text-gray-100">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-4xl bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-2xl mt-6 sm:mt-10 border-2 border-fuchsia-800 transition hover:shadow-fuchsia-800/50">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-6 sm:mb-8 text-white">
          User Profile
        </h1>

        {isLoading && !user && (
          <div className="flex flex-col items-center justify-center h-40">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-fuchsia-500 border-dotted rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 p-4 bg-red-900/30 border border-red-800 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {user && (
          <div className="space-y-6 sm:space-y-8">
            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6 sm:space-y-8">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 pb-6 border-b border-gray-600">
                  <div className="relative flex-shrink-0">
                    <img
                      src={previewUrl || formData.avatar}
                      alt="User Avatar"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 shadow-lg object-cover border-fuchsia-800 transition"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-2 bg-fuchsia-600 rounded-full cursor-pointer hover:bg-fuchsia-700 transition"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        {user.userType === "influencer" ? "Name" : "Business Name"}
                      </label>
                      <input
                        type="text"
                        name={user.userType === "influencer" ? "name" : "businessName"}
                        value={user.userType === "influencer" ? (formData.name || "") : (formData.businessName || "")}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 border-2 border-fuchsia-800 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        {user.userType === "influencer" ? "Bio" : "Description"}
                      </label>
                      <textarea
                        name={user.userType === "influencer" ? "bio" : "description"}
                        value={user.userType === "influencer" ? (formData.bio || "") : (formData.description || "")}
                        onChange={handleInputChange}
                        rows="2"
                        className="mt-1 block w-full bg-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 border-2 border-fuchsia-800 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.userType === "influencer" && (
                    <>
                      <InputField label="Instagram" name="instagram" value={formData.instagram} onChange={handleInputChange} />
                      <InputField label="YouTube" name="youtube" value={formData.youtube} onChange={handleInputChange} />
                      <InputField label="Facebook" name="facebook" value={formData.facebook} onChange={handleInputChange} />
                      <InputField label="Followers" name="followers" type="number" value={formData.followers} onChange={handleInputChange} />
                    </>
                  )}

                  {user.userType === "advertiser" && (
                    <>
                      <InputField label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} />
                      <InputField label="Industry" name="industry" value={formData.industry} onChange={handleInputChange} />
                      <InputField label="Budget ₹" name="budget" type="number" value={formData.budget} onChange={handleInputChange} />
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-600">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-fuchsia-600 text-white font-semibold rounded-full shadow-lg flex items-center justify-center space-x-2 border-2 border-fuchsia-800 hover:bg-fuchsia-700 transition disabled:opacity-50"
                  >
                    <FaSave />
                    <span>{isLoading ? "Saving..." : "Save"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setAvatarFile(null);
                      setPreviewUrl(null);
                      setFormData(user);
                    }}
                    className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-full shadow-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2"
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 pb-6 border-b border-gray-600">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar || defaultAvatar}
                      alt="User Avatar"
                      className="w-32 h-32 rounded-full border-4 shadow-lg object-cover border-fuchsia-800 transition"
                    />
                  </div>

                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-1 capitalize text-gray-100">
                      {user.name || user.businessName || "User"}
                    </h2>
                    <p className="text-fuchsia-400 break-all">{user.email}</p>
                    <p className="mt-2 text-gray-400">
                      {user.userType === "influencer" ? user.bio : user.description}
                    </p>
                  </div>
                  <div className="flex justify-center md:justify-end w-full md:w-auto">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-fuchsia-800 text-white font-semibold rounded-full shadow-lg border-2 border-fuchsia-800 transition hover:bg-fuchsia-700 flex items-center space-x-2"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>

                {user.subscription && user.userType === "influencer" && (
                  <div className="bg-fuchsia-700/20 p-4 sm:p-6 rounded-xl border border-fuchsia-700/30">
                    <h2 className="text-xl font-bold mb-4 flex items-center space-x-3 text-white">
                      <FaCreditCard />
                      <span>Subscription Status</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoBox icon={<FaCalendarAlt className="text-fuchsia-400" />} label="Plan" value={user.subscription.plan} />
                      {user.subscription.expiryDate && (
                        <InfoBox icon={<FaCalendarAlt className="text-fuchsia-400" />} label="Expires" value={formatDate(user.subscription.expiryDate)} />
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-700/50 p-4 sm:p-6 rounded-xl border border-gray-600">
                  <h2 className="text-lg font-semibold mb-4 text-white">Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-fuchsia-500" />
                      <span className="capitalize">{user.name || user.businessName}</span>
                    </div>
                    <div className="flex items-center space-x-3 break-all">
                      <FaEnvelope className="text-fuchsia-500" />
                      <span>{user.email}</span>
                    </div>
                    {user.userType === "influencer" ? (
                      <>
                        <div className="flex items-center space-x-3"><FaInstagram className="text-fuchsia-500" /><span>@{user.instagram || "N/A"}</span></div>
                        <div className="flex items-center space-x-3"><FaUser className="text-fuchsia-500" /><span>{user.followers?.toLocaleString()} Followers</span></div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3"><FaBuilding className="text-fuchsia-500" /><span>{user.industry || "N/A"}</span></div>
                        <div className="flex items-center space-x-3"><FaDollarSign className="text-fuchsia-500" /><span>Budget: ₹{user.budget?.toLocaleString()}</span></div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
    <input
      id={name}
      type={type}
      name={name}
      value={value || (type === "number" ? "" : "")}
      onChange={onChange}
      className="mt-1 block w-full bg-gray-700 rounded-md py-2 px-3 text-white focus:outline-none border-2 border-fuchsia-800 transition focus:ring-2 focus:ring-fuchsia-500"
    />
  </div>
);

const InfoBox = ({ icon, label, value }) => (
  <div className="flex flex-col p-3 bg-gray-900/50 rounded-lg border border-fuchsia-600/30">
    <div className="flex items-center space-x-2 mb-1 text-xs font-bold text-fuchsia-300 uppercase">
      {icon} <span>{label}</span>
    </div>
    <p className="text-lg font-bold text-white truncate">{value}</p>
  </div>
);

export default Profile;