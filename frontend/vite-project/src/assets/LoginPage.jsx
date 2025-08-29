// Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { AuthContext } from "./AuthContext"; // ✅ AuthContext import

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // ✅ Context se login function

  const inputStyle =
    "w-full p-3 bg-slate-700 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all duration-200 text-white placeholder-gray-400 neno-button shadow-x1 hover:shadow-fuchsia-800/50";

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = { email, password };

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ AuthContext + localStorage dono update
        if (data.user && data.token) {
          login(data.user, data.token); // context update karega
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        toast.success(data.msg || "Login successful!");

        // ✅ Redirect thoda delay ke baad
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        toast.error(data.msg || "Login failed.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Login failed. Please check credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8 font-inter">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-md bg-gray-800 text-white p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h2 className="text-4xl font-extrabold text-center mb-6 text-white">
          Login
        </h2>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1 text-gray-300">Email</label>
            <input
              type="email"
              required
              className={inputStyle}
              placeholder="your@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Password</label>
            <input
              type="password"
              required
              className={inputStyle}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full neno-button bg-fuchsia-700 hover:bg-fuchsia-600 text-white py-3 rounded-xl mt-6 font-bold uppercase transition-all duration-300 active:scale-95 transform hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-fuchsia-500 neno-button hover:text-fuchsia-600 font-semibold"
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
