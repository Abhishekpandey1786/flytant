import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

function Signup() {
  const [userType, setUserType] = useState("advertiser");
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [industry, setIndustry] = useState("");
  const [budget, setBudget] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [facebook, setFacebook] = useState("");
  const [followers, setFollowers] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const inputStyle =
    "w-full p-3 bg-slate-700 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all duration-200 text-white placeholder-gray-400 neno-button shadow-x1 hover:shadow-fuchsia-800/50";

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // Advertiser-specific validations
    if (userType === "advertiser") {
      if (!businessName || businessName.length < 2) {
        toast.error("Please enter a valid business name.");
        return;
      }
      if (!contactPerson || contactPerson.length < 2) {
        toast.error("Please enter a valid contact person name.");
        return;
      }
      if (!industry || industry.length < 2) {
        toast.error("Please enter a valid industry.");
        return;
      }
      if (isNaN(budget) || Number(budget) <= 0) {
        toast.error("Please enter a valid positive budget.");
        return;
      }
    }

    // Influencer-specific validations
    if (userType === "influencer") {
      if (!name || name.length < 2) {
        toast.error("Please enter your name.");
        return;
      }
      if (!instagram || instagram.length < 2) {
        toast.error("Enter a valid Instagram handle.");
        return;
      }
      if (!youtube || youtube.length < 2) {
        toast.error("Enter a valid YouTube channel.");
        return;
      }
      if (!facebook || facebook.length < 2) {
        toast.error("Enter a valid Facebook page.");
        return;
      }
      if (isNaN(followers) || Number(followers) <= 0) {
        toast.error("Enter a valid follower count.");
        return;
      }
    }

    const formData = {
      userType,
      name: userType === "advertiser" ? undefined : name,
      businessName: userType === "advertiser" ? businessName : undefined,
      contactPerson,
      industry,
      budget,
      instagram,
      youtube,
      facebook,
      followers,
      email,
      password,
    };

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.msg || "Signup successful!");
        setTimeout(() => navigate("/login"), 1500); // Wait for toast then redirect
      } else {
        toast.error(data.msg || "Signup failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8 font-inter">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md bg-gray-800 text-white p-8 rounded-2xl shadow-2xl border border-gray-700 relative">
        <Link to="/">
          <h2 className="text-4xl font-extrabold text-center mb-6 text-white">
            Login | Signup
          </h2>
        </Link>

        <div className="flex justify-center mb-6">
          <select
            onChange={handleUserTypeChange}
            value={userType}
            className="neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 hover:bg-fuchsia-800 border-fuchsia-800 rounded-lg py-3 px-6 uppercase"
          >
            <option value="advertiser" className="bg-slate-800">
              Advertiser
            </option>
            <option value="influencer" className="bg-slate-800">
              Influencer
            </option>
          </select>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-gray-300">
              {userType === "advertiser" ? "Business Name" : "Name"}
            </label>
            <input
              type="text"
              required
              className={inputStyle}
              placeholder={
                userType === "advertiser"
                  ? "Enter your business name"
                  : "Enter your name"
              }
              value={userType === "advertiser" ? businessName : name}
              onChange={(e) =>
                userType === "advertiser"
                  ? setBusinessName(e.target.value)
                  : setName(e.target.value)
              }
            />
          </div>

          {userType === "advertiser" && (
            <>
              <div>
                <label className="block mb-1 text-gray-300">Contact</label>
                <input
                  type="text"
                  required
                  className={inputStyle}
                  placeholder="Enter contact person name"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Industry/Niche</label>
                <input
                  type="text"
                  required
                  className={inputStyle}
                  placeholder="e.g. Fashion, Tech, Food"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Budget ($)</label>
                <input
                  type="number"
                  required
                  className={inputStyle}
                  placeholder="Enter your budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </>
          )}

          {userType === "influencer" && (
            <>
              <div>
                <label className="block mb-1 text-gray-300">Instagram Handle</label>
                <input
                  type="text"
                  required
                  className={inputStyle}
                  placeholder="Instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-300">YouTube Channel</label>
                <input
                  type="text"
                  required
                  className={inputStyle}
                  placeholder="YouTube"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-300">Facebook Page</label>
                <input
                  type="text"
                  required
                  className={inputStyle}
                  placeholder="Facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-300">Total Followers</label>
                <input
                  type="number"
                  required
                  className={inputStyle}
                  placeholder="Enter total number of followers"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                />
              </div>
            </>
          )}

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
            Signup
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-fuchsia-500 neno-button  hover:text-fuchsia-600  font-semibold"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
