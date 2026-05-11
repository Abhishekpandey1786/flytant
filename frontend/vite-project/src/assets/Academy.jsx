import React, { useState } from "react";
import axios from "axios";
import { BookOpen, Star, Layout, PenTool, Lock, ArrowRight, X, FileText, PlayCircle } from "lucide-react";

const Academy = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  
  // Naya state selected course ke liye
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://vistafluence.onrender.com/api/academy/login", credentials);
      if (res.data.success) {
        localStorage.setItem("studentToken", res.data.token);
        setIsLoggedIn(true);
      }
    } catch (err) {
      alert("Wrong details! Please ask the admin for the password.");
    } finally {
      setLoading(false);
    }
  };
  const courses = [
    { 
      title: "Beginner Course", 
      icon: <BookOpen className="text-fuchsia-400" />, 
      desc: "Start your journey from scratch.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Embed link zaroori hai
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
    },
    { 
      title: "Advanced Growth", 
      icon: <Star className="text-fuchsia-400" />, 
      desc: "Scale your reach to the moon.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      pdfUrl: "#" 
    },
    { 
      title: "Trending Ideas", 
      icon: <Layout className="text-fuchsia-400" />, 
      desc: "Viral content frameworks.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      pdfUrl: "#" 
    },
    { 
      title: "Tools & Services", 
      icon: <PenTool className="text-fuchsia-400" />, 
      desc: "Premium assets for creators.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      pdfUrl: "#" 
    },
  ];

  // --- LOGIN UI ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-slate-950 to-slate-950"></div>
        <form onSubmit={handleLogin} className="relative z-10 bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-fuchsia-600/20 p-4 rounded-2xl">
              <Lock className="text-fuchsia-500 w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">Academy Access</h2>
          <p className="text-slate-400 text-center mb-8 text-sm">Enter credentials to unlock content.</p>
          <div className="space-y-4">
            <input type="email" placeholder="Email" required className="w-full p-4 rounded-xl bg-slate-800/50 border border-white/5 outline-none focus:border-fuchsia-500" onChange={(e) => setCredentials({...credentials, email: e.target.value})} />
            <input type="password" placeholder="Password" required className="w-full p-4 rounded-xl bg-slate-800/50 border border-white/5 outline-none focus:border-fuchsia-500" onChange={(e) => setCredentials({...credentials, password: e.target.value})} />
            <button disabled={loading} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all">
              {loading ? "Verifying..." : "Unlock Academy"} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative">
      {/* Navbar */}
      <nav className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
        <h1 className="text-xl font-bold tracking-tighter uppercase text-fuchsia-500">Vistafluence</h1>
        <button onClick={() => setIsLoggedIn(false)} className="text-sm text-slate-400 hover:text-white">Logout</button>
      </nav>

      <main className="max-w-7xl mx-auto p-10">
        <header className="mb-12">
          <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            🎓 Welcome, Legend.
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl">Pick a module and start learning.</p>
        </header>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, i) => (
            <div 
              key={i}
              onClick={() => setSelectedCourse(course)}
              className="group relative p-8 bg-slate-900/40 border border-white/5 rounded-[2rem] hover:bg-slate-900/60 transition-all cursor-pointer hover:-translate-y-2 shadow-lg"
            >
              <div className="mb-6 p-3 bg-slate-800 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                {course.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-fuchsia-400 transition-colors">{course.title}</h3>
              <p className="text-slate-400 text-sm mb-6">{course.desc}</p>
              <div className="flex items-center text-xs font-bold uppercase tracking-widest text-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Start Watching <ArrowRight size={14} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- COURSE VIEWER MODAL --- */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedCourse(null)}></div>
          
          {/* Modal Content */}
          <div className="relative z-10 bg-slate-900 border border-white/10 w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-fuchsia-400">{selectedCourse.title}</h3>
              <button onClick={() => setSelectedCourse(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Video Player */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black mb-8 border border-white/5 shadow-inner">
                <iframe 
                  src={selectedCourse.videoUrl}
                  title="Course Content"
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Resources Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-fuchsia-600/20 rounded-xl">
                      <FileText className="text-fuchsia-500" />
                    </div>
                    <div>
                      <p className="font-bold">Study Material</p>
                      <p className="text-xs text-slate-400 italic">PDF, Resources, Guide</p>
                    </div>
                  </div>
                  <a 
                    href={selectedCourse.pdfUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-fuchsia-500 hover:text-white transition-all"
                  >
                    Download
                  </a>
                </div>

                <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5 flex items-center gap-4">
                   <div className="p-3 bg-blue-600/20 rounded-xl">
                      <PlayCircle className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-bold">Module Status</p>
                      <p className="text-xs text-slate-400 italic font-mono uppercase tracking-tighter">In Progress...</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academy;