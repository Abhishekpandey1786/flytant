import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Lock, ArrowRight, X, ChevronDown } from "lucide-react";
import chapter1Pdf from "./image/Chapter-1-Beginner-Influencer.pdf";
import chapter2Pdf from "./image/HowToPickNiche.pdf";
import chapter3Pdf from "./image/ProfileOptimization.pdf";
import chapter4Pdf from "./image/0-10K.pptx.pdf";
import chapter5Pdf from "./image/Chapter-2-Monetization.pdf";
import chapter6Pdf from "./image/BrandDeals.pdf";
import chapter7Pdf from "./image/PricingStrategy.pdf";
import chapter8Pdf from "./image/OutreachScripts.pdf";
import chapter9Pdf from "./image/Chapter_3ContentMastery.pdf";
import chapter10Pdf from "./image/EditingTricks.pdf";
import chapter11Pdf from "./image/Storytelling.pdf";
import chapter12Pdf from "./image/ViralHooks.pdf";
const courseData = [
  {
    id: "1",
    title: "Beginner Influencer",
    desc: "Who influencers are, and the 7 core steps to get started.",
    pdfUrl: chapter1Pdf,
    parts: [
      {
        id: "1.1",
        title: "How to Pick Your Niche",
        desc: "Finding the overlap between passion, knowledge and market demand.",
        pdfUrl: chapter2Pdf,
      },
      {
        id: "1.2",
        title: "Profile Optimization",
        desc: "Turning your profile into a digital business card.",
        pdfUrl: chapter3Pdf,
      },
      {
        id: "1.3",
        title: "Getting Your First 10K Followers",
        desc: "The proven tactics that compound into real growth.",
        pdfUrl: chapter4Pdf,
      },
    ],
  },
  {
    id: "2",
    title: "Monetization",
    desc: "The main revenue streams available to influencers.",
    pdfUrl: chapter5Pdf,
    parts: [
      {
        id: "2.1",
        title: "Brand Deals",
        desc: "How brands choose influencers, and how deals actually work.",
        pdfUrl: chapter6Pdf,
      },
      {
        id: "2.2",
        title: "Pricing Strategy",
        desc: "How to price your content and negotiate with brands.",
        pdfUrl: chapter7Pdf,
      },
      {
        id: "2.3",
        title: "Outreach Scripts",
        desc: "Templates for approaching brands directly instead of waiting.",
        pdfUrl: chapter8Pdf,
      },
    ],
  },
  {
    id: "3",
    title: "Content Mastery",
    desc: "The building blocks behind consistently good content.",
    pdfUrl: chapter9Pdf,
    parts: [
      {
        id: "3.1",
        title: "Editing Tricks",
        desc: "Editing transforms raw footage into a compelling story.",
        pdfUrl: chapter10Pdf,
      },
      {
        id: "3.2",
        title: "Storytelling",
        desc: "One of the most powerful communication skills in content creation.",
        pdfUrl: chapter11Pdf,
      },
      {
        id: "3.3",
        title: "Viral Hooks",
        desc: "How to earn the first three seconds of attention.",
        pdfUrl: chapter12Pdf,
      },
    ],
  },
];

const PdfViewer = ({ url,}) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadPdfJs = () =>
      new Promise((resolve, reject) => {
        if (window.pdfjsLib) return resolve(window.pdfjsLib);
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => resolve(window.pdfjsLib);
        script.onerror = () => reject(new Error("pdf.js failed to load"));
        document.body.appendChild(script);
      });

    const renderPageToCanvas = async (page, scale) => {
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.maxWidth = "900px";
      canvas.style.display = "block";
      canvas.style.margin = "0 auto 12px auto";
      canvas.style.borderRadius = "12px";
      canvas.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
      canvas.oncontextmenu = (e) => e.preventDefault();
      canvas.ondragstart = (e) => e.preventDefault();

      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;
      return canvas;
    };

    const render = async () => {
      setLoading(true);
      setError(null);
      setProgress({ done: 0, total: 0 });
      try {
        const pdfjsLib = await loadPdfJs();
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const pdf = await pdfjsLib.getDocument({
          url,
          rangeChunkSize: 65536,
          disableAutoFetch: true,
        }).promise;
        if (cancelled) return;

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";

        const w = window.innerWidth;
        const scale = w < 400 ? 0.9 : w < 640 ? 1.1 : w < 1024 ? 1.4 : 1.6;

        setProgress({ done: 0, total: pdf.numPages });
        const firstPage = await pdf.getPage(1);
        if (cancelled) return;
        const firstCanvas = await renderPageToCanvas(firstPage, scale);
        if (cancelled) return;
        container.appendChild(firstCanvas);
        setLoading(false);
        setProgress({ done: 1, total: pdf.numPages });

        for (let i = 2; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          if (cancelled) return;
          const canvas = await renderPageToCanvas(page, scale);
          if (cancelled) return;
          container.appendChild(canvas);
          setProgress({ done: i, total: pdf.numPages });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "PDF load nahi ho paayi. pdfUrl check karein — ye ek public https link hona chahiye."
          );
          setLoading(false);
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    const blockKeys = (e) => {
      const k = e.key.toLowerCase();
      const combo = (e.ctrlKey || e.metaKey) && ["s", "p", "c", "u"].includes(k);
      if (combo || e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const blockContext = (e) => e.preventDefault();

    document.addEventListener("keydown", blockKeys, true);
    document.addEventListener("contextmenu", blockContext);
    return () => {
      document.removeEventListener("keydown", blockKeys, true);
      document.removeEventListener("contextmenu", blockContext);
    };
  }, []);

  const stillStreaming =
    !loading && !error && progress.total > 0 && progress.done < progress.total;

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        onContextMenu={(e) => e.preventDefault()}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
        className="p-2 sm:p-4 min-h-[300px] w-full"
      />

      {loading && (
        <p className="text-slate-400 text-center py-10 text-sm sm:text-base">
          Loading PDF…
        </p>
      )}
      {error && (
        <p className="text-red-400 text-center py-10 px-6 text-sm sm:text-base">
          {error}
        </p>
      )}
      {stillStreaming && (
        <p className="text-slate-500 text-center text-xs pb-6">
          Loading page {progress.done + 1} of {progress.total}…
        </p>
      )}
      {!loading && !error && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.06]"
          style={{ userSelect: "none" }}
        >
          <div
            className="text-white text-xl sm:text-2xl md:text-4xl font-black whitespace-nowrap"
            style={{ transform: "rotate(-30deg)" }}
          >
            {Array(20).fill(watermarkText).join("   •   ")}
          </div>
        </div>
      )}
    </div>
  );
};

const ChapterGroup = ({ chapter, index, onOpen }) => {
  const [open, setOpen] = useState(true);

  return (
    <section className="relative">
     
      <div
        onClick={() => onOpen(chapter)}
        className="group relative flex items-center gap-3 sm:gap-6 p-4 sm:p-8 bg-gradient-to-br from-fuchsia-950/40 to-slate-900/60 border border-fuchsia-500/20 rounded-2xl sm:rounded-[1.75rem] cursor-pointer hover:border-fuchsia-500/50 transition-all shadow-lg"
      >
        <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
          <span className="shrink-0 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-300 font-mono font-bold text-base sm:text-xl">
            {chapter.id}
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-fuchsia-400">
              Chapter {chapter.id}
            </span>
            <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white leading-snug line-clamp-2 sm:line-clamp-1 md:line-clamp-none">
              {chapter.title}
            </h3>
            <p className="hidden sm:block text-slate-400 text-sm mt-1 line-clamp-2">
              {chapter.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(chapter);
            }}
            className="hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
          >
            Open Overview <ArrowRight size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Toggle parts"
          >
            <ChevronDown
              size={18}
              className={`text-slate-300 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="relative pl-4 sm:pl-10 ml-4 sm:ml-7 border-l-2 border-dashed border-fuchsia-500/25">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 pb-2">
              {chapter.parts.map((part) => (
                <div
                  key={part.id}
                  onClick={() => onOpen(part)}
                  className="group relative -ml-[2px] sm:before:content-[''] sm:before:absolute sm:before:-left-10 sm:before:top-8 sm:before:w-10 sm:before:h-[2px] sm:before:bg-fuchsia-500/25 p-4 sm:p-6 bg-slate-900/40 border border-white/5 rounded-xl sm:rounded-2xl hover:bg-slate-900/70 hover:border-fuchsia-500/30 transition-all cursor-pointer hover:-translate-y-1 shadow-md"
                >
                  <div className="mb-3 sm:mb-4 p-2 sm:p-2.5 bg-slate-800 rounded-lg sm:rounded-xl w-fit group-hover:scale-110 transition-transform">
                    <span className="text-fuchsia-400 font-mono text-xs font-bold">
                      {part.id}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base md:text-lg font-bold mb-1.5 text-white group-hover:text-fuchsia-400 transition-colors">
                    {part.title}
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                    {part.desc}
                  </p>
                  <div className="flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-fuchsia-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight size={12} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {index !== undefined && (
        <div className="h-6 sm:h-12" aria-hidden="true" />
      )}
    </section>
  );
};

const Academy = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "https://vistafluence.onrender.com/api/academy/login",
        credentials
      );
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-slate-950 to-slate-950"></div>
        <form
          onSubmit={handleLogin}
          className="relative z-10 bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/10 w-full max-w-md shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-fuchsia-600/20 p-4 rounded-2xl">
              <Lock className="text-fuchsia-500 w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            Academy Access
          </h2>
          <p className="text-slate-400 text-center mb-8 text-sm">
            Enter credentials to unlock content.
          </p>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full p-4 rounded-xl bg-slate-800/50 border border-white/5 outline-none focus:border-fuchsia-500"
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full p-4 rounded-xl bg-slate-800/50 border border-white/5 outline-none focus:border-fuchsia-500"
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
            />
            <button
              disabled={loading}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all"
            >
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
      <nav className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
        <h1 className="text-lg sm:text-xl font-bold tracking-tighter uppercase text-fuchsia-500">
          Vistafluence
        </h1>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="text-sm text-slate-400 hover:text-white"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:p-8 lg:p-10">
        <header className="mb-8 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-4 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            🎓 Welcome, Legend.
          </h2>
          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl">
            Work through each chapter and its parts, in order or however you
            like.
          </p>
        </header>
        <div className="flex flex-col">
          {courseData.map((chapter, i) => (
            <ChapterGroup
              key={chapter.id}
              chapter={chapter}
              index={i}
              onOpen={setSelectedModule}
            />
          ))}
        </div>
      </main>
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-10">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setSelectedModule(null)}
          ></div>

          <div className="relative z-10 bg-slate-900 border border-white/10 w-full h-full sm:h-auto sm:max-w-2xl md:max-w-3xl rounded-none sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col sm:max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-center gap-3 shrink-0">
              <div className="min-w-0">
                <span className="text-xs font-mono text-fuchsia-500 uppercase tracking-widest">
                  Module {selectedModule.id}
                </span>
                <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white truncate">
                  {selectedModule.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="text-white" size={20} />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0">
              <PdfViewer url={selectedModule.pdfUrl} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academy;