import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";

const api = axios.create({
  baseURL: "https://vistafluence.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default function ChatList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?._id) return;

      setLoading(true);

      try {
        const [brandsRes, influencersRes] =
          await Promise.all([
            api.get("/advertiser/brands"),
            api.get("/users/influencers"),
          ]);

        let combined = [
          ...brandsRes.data,
          ...influencersRes.data,
        ];

        combined = combined.filter(
          (u) => u._id !== user._id
        );

        setUsers(combined);
      } catch (error) {
        console.error(
          "Failed to fetch users:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleUserClick = (otherUser) => {
    navigate("/chats", {
      state: {
        selectedUser: otherUser,
      },
    });
  };

  if (loading) {
    return (
      <div className="text-center text-white p-6">
        Loading chats...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white">
          Conversations
        </h2>
      </div>

      <div className="p-4 space-y-3">
        {users.map((otherUser) => (
          <div
            key={otherUser._id}
            onClick={() =>
              handleUserClick(otherUser)
            }
            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 cursor-pointer transition-all"
          >
            <img
              src={
                otherUser.avatar ||
                otherUser.logo ||
                "https://placehold.co/50"
              }
              alt=""
              className="w-14 h-14 rounded-full object-cover border border-fuchsia-500"
            />

            <div>
              <h3 className="text-white font-semibold">
                {otherUser.name ||
                  otherUser.businessName}
              </h3>

              <p className="text-sm text-slate-400">
                Click to start chat
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}