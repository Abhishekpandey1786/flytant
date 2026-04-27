import React, { useState } from "react";
import axios from "axios";

const Academy = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Login route bhi update ho gaya: /api/academy/login
      const res = await axios.post("https://vistafluence.onrender.com/api/academy/login", credentials);
      if (res.data.success) {
        localStorage.setItem("studentToken", res.data.token);
        setIsLoggedIn(true);
      }
    } catch (err) {
      alert("Ghalat details! Admin se password maango.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        {/* Tera Login Form yahan aayega (Wahi fuchsia theme wala) */}
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-3xl border border-fuchsia-600">
           <h2 className="text-white text-2xl mb-4">Academy Login</h2>
           <input 
             type="email" placeholder="Email" className="w-full mb-3 p-3 rounded bg-slate-800 text-white"
             onChange={(e) => setCredentials({...credentials, email: e.target.value})}
           />
           <input 
             type="password" placeholder="Password" className="w-full mb-6 p-3 rounded bg-slate-800 text-white"
             onChange={(e) => setCredentials({...credentials, password: e.target.value})}
           />
           <button className="w-full bg-fuchsia-600 p-3 rounded font-bold text-white">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-4xl font-bold">🎓 Welcome to Vistafluence Academy</h1>
      <p className="mt-4 text-slate-400">Yahan tera saara premium content (Videos/PDFs) dikhega.</p>
      {/* Yahan courses map kar dena */}
    </div>
  );
};

export default Academy;