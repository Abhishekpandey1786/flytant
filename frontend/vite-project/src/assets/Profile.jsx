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
} from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { AuthContext } from "./AuthContext";
import imageCompression from "browser-image-compression";

const Profile = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  const defaultAvatar =
    "https://placehold.co/150x150/5B21B6/ffffff?text=User";

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError("User not authenticated. Please log in.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          const fetchedUser = {
            ...data.user,
            avatar: data.user.avatar
              ? `http://localhost:5000${data.user.avatar}`
              : defaultAvatar,
            bio: data.user.bio || "",
            description: data.user.description || "A leading brand...",
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
  }, [token, setUser, defaultAvatar]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        "http://localhost:5000/api/users/me",
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

      let updatedUser = textUpdateData.user;
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatarFile);

        const avatarUpdateResponse = await fetch(
          "http://localhost:5000/api/users/me/avatar",
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
          avatar: `http://localhost:5000${avatarUpdateData.user.avatar}`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center p-4 sm:p-6 font-sans text-gray-100 neno-button  hover:shadow-fuchsia-800/50  transition">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-4xl bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-2xl  mt-6 sm:mt-10   neno-button  hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition">
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
            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6 sm:space-y-8">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 pb-6 border-b border-gray-600">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        avatarFile
                          ? URL.createObjectURL(avatarFile)
                          : formData.avatar
                      }
                      alt="User Avatar"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 shadow-lg object-cover neno-button  hover:shadow-fuchsia-800/50  border-fuchsia-800 transition"
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
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-400">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className="mt-1 block w-full bg-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 neno-button  hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="submit"
                    className="px-5 sm:px-6 py-2 bg-fuchsia-600 text-white font-semibold rounded-full shadow-lg  flex items-center justify-center space-x-2 neno-button  hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 transition"
                  >
                    <FaSave />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 sm:px-6 py-2 bg-gray-600 text-white font-semibold rounded-full shadow-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2"
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 pb-6 border-b border-gray-600 ">
                  <div className="relative flex-shrink-0">
                    <img
                      src={formData.avatar || defaultAvatar}
                      alt="User Avatar"
                      className="w-32 h-32 sm:w-32 sm:h-32 border-4 rounded-full  shadow-lg object-cover neno-button  hover:shadow-fuchsia-800/50 border-fuchsia-800 transition"
                    />
                  </div>
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
                      className="px-5 sm:px-6 py-2 bg-fuchsia-600 text-white font-semibold rounded-full shadow-lg  transition flex items-center space-x-2 neno-button  hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800 "
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
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

                {/* Influencer */}
                {user.userType === "influencer" && (
                  <div className="bg-gray-700 p-4 sm:p-6 rounded-xl shadow-inner border border-gray-600">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">
                      Influencer Profile
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.instagram && (
                        <div className="flex items-center space-x-3 break-all">
                          <FaInstagram className="text-fuchsia-500" />
                          <span>{user.instagram}</span>
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

                {/* Advertiser */}
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
                          <span>{user.contactPerson}</span>
                        </div>
                      )}
                      {user.industry && (
                        <div className="flex items-center space-x-3">
                          <span>Industry: {user.industry}</span>
                        </div>
                      )}
                      {user.budget && (
                        <div className="flex items-center space-x-3">
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

export default Profile;
