import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://vistafluence.onrender.com/api/admin/login", { password });
      localStorage.setItem("adminToken", res.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="p-8 bg-slate-800 rounded-xl w-80 text-center neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800">
        <h2 className="text-white text-2xl mb-6">Admin Login</h2>
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-slate-700 text-white neno-button shadow-xl hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full py-2 bg-fuchsia-800 rounded text-white hover:active:scale-85 transition duration-300 neno-button shadow-xs hover:shadow-fuchsia-800/50 border-2 border-fuchsia-800"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
