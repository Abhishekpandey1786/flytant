// src/components/ChatList.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function ChatList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChattableUsers = async () => {
      if (!user) {
        console.log("User not found in AuthContext");
        return;
      }

      setLoading(true);
      try {
        const [brandsRes, influencersRes] = await Promise.all([
          api.get("/advertiser/brands"),
          api.get("/users/influencers"),
        ]);

        let combined = [...brandsRes.data, ...influencersRes.data];
        combined = combined.filter((u) => u._id !== user._id);

        console.log("Fetched users:", combined);
        setUsers(combined);
      } catch (error) {
        console.error(
          "Failed to fetch users:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChattableUsers();
  }, [user]);

  const handleUserClick = (otherUser) => {
    if (!user || !otherUser) return;
    const campaignId = [user._id, otherUser._id].sort().join("_");

    navigate(`/chats`);
  };

  if (loading)
    return <div className="text-center p-4">Loading chat list...</div>;

  if (users.length === 0)
    return (
      <div className="text-center p-4">
        Koi user chat ke liye available nahi hai.
      </div>
    );

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto border rounded-lg shadow bg-white relative">
      <div className="p-3 border-b font-semibold bg-gray-50">
        Conversations
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {users.map((otherUser) => (
          <div
            key={otherUser._id}
            onClick={() => handleUserClick(otherUser)}
            className="flex items-center space-x-4 p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition"
          >
            <img
              src={
                otherUser.avatar ||
                otherUser.logo ||
                "https://placehold.co/50x50"
              }
              alt={otherUser.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="font-bold">{otherUser.name}</div>
              <div className="text-sm text-gray-500">
                Chat shuru karne ke liye click karein
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
