import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer"
import img1 from "./image/banner1.png"
const Home = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [influencerOffset, setInfluencerOffset] = useState(0);
  const [brandOffset, setBrandOffset] = useState(0);
  const [articleIndex, setArticleIndex] = useState(0);
  const [newsIndex, setNewsIndex] = useState(0);

  const influencerRef = useRef(null);
  const brandRef = useRef(null);

  // DATA
  const influencers = [
    {
      name: "Olivia Fox",
      category: "Fashion",
      followers: "378k",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
    {
      name: "Bhavya Shah",
      category: "Travel",
      followers: "491k",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    },
    {
      name: "Malini",
      category: "Beauty",
      followers: "210k",
      img: "https://images.unsplash.com/photo-1524504527035-189b0ad6d595",
    },
    {
      name: "Kunal",
      category: "Fitness",
      followers: "1.2M",
      img: "https://images.unsplash.com/photo-1502767089025-6572583495b0",
    },
  ];

  const brands = [
    "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    "https://upload.wikimedia.org/wikipedia/commons/2/24/Adidas_logo.png",
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
  ];

  const articles = [
    {
      title: "Exploring the Neuroscience Behind Meditation",
      img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
      tag: "Social",
    },
    {
      title: "The Power of Influencer Marketing",
      img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
      tag: "Business",
    },
  ];

  const news = [
    {
      img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
      text: "A bunch of Instagram influencers are facing a lawsuit over misleading ads. The suit claims they endorsed weight loss products without disclosure.",
    },
    {
      img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
      text: "New marketing trends for 2026 are emerging rapidly in the digital space.",
    },
  ];

  useEffect(() => {
    const i = setInterval(() => setInfluencerOffset((prev) => prev + 1), 25);
    const b = setInterval(() => setBrandOffset((prev) => prev + 0.8), 25);
    const a = setInterval(
      () => setArticleIndex((prev) => (prev + 1) % articles.length),
      4000,
    );
    const n = setInterval(
      () => setNewsIndex((prev) => (prev + 1) % news.length),
      4000,
    );
    return () => {
      clearInterval(i);
      clearInterval(b);
      clearInterval(a);
      clearInterval(n);
    };
  }, []);

  useEffect(() => {
    if (
      influencerRef.current &&
      influencerOffset >= influencerRef.current.scrollWidth / 2
    )
      setInfluencerOffset(0);
    if (brandRef.current && brandOffset >= brandRef.current.scrollWidth / 2)
      setBrandOffset(0);
  }, [influencerOffset, brandOffset]);

  return (
    <div className="bg-slate-900 text-white min-h-screen selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-4 md:px-10 py-4 md:py-6 sticky top-0 bg-slate-900/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
            <div className="absolute w-5 h-7 md:w-6 md:h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-tr-xl rounded-bl-sm transform skew-x-[-20deg] translate-x-1.5 md:translate-x-2"></div>
            <div className="absolute w-5 h-7 md:w-6 md:h-8 bg-gradient-to-tr from-pink-500 to-magenta-600 rounded-tl-xl rounded-br-sm transform skew-x-[20deg] -translate-x-1.5 md:-translate-x-2"></div>
          </div>
          <div className="flex flex-col leading-tight">
           <Link to="/"> <span className="text-lg md:text-2xl font-black tracking-tighter bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent uppercase">
              Vistafluence
            </span></Link>
            <span className=" md:block md:text-[9px] text-[7px] tracking-[0.2em] text-slate-400 font-bold uppercase">
              No Middlemen. Just Real Collaborations.
            </span>
          </div>
        </div>

        <div className="flex gap-2 md:gap-4">
          <button className="hidden sm:block bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold transition text-xs md:text-sm border border-slate-700">
            Contact
          </button>
          <Link to="/login">
            <button className="neno-button shadow-xl hover:shadow-fuchsia-800/50 text-white bg-fuchsia-700 hover:bg-fuchsia-700 border-fuchsia-700 transition px-4 md:px-6 py-1.5 md:py-2 rounded-lg font-bold  text-xs md:text-sm whitespace-nowrap">
              Login | Signup
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-20 lg:px-40 py-12 md:py-20 gap-10">
        <div className="w-full md:max-w-xl text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Connecting <br className="hidden md:block" />
            <span className="text-slate-400">Brands & Influencers</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg mb-8">
            Find Influencers and Brands of your niche
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              className="h-10 md:h-12 cursor-pointer"
              alt="Play Store"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              className="h-10 md:h-12 cursor-pointer"
              alt="App Store"
            />
          </div>
        </div>

        <div
          className="relative group cursor-pointer w-full md:w-auto flex justify-center"
          onClick={() => setShowVideo(true)}
        >
          <img
            src={img1}
            className="w-full max-w-[450px] aspect-video md:aspect-auto md:h-[300px] rounded-3xl object-cover border-4 border-slate-800 shadow-2xl"
            alt="hero"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition">
              <span className="text-xl md:text-2xl ml-1 ">▶</span>
            </div>
          </div>
        </div>
      </div>

      {/* INFLUENCERS SLIDER SECTION */}
      <div className="flex flex-col lg:flex-row items-center px-4 md:px-10 py-10 md:py-16 gap-10 bg-slate-800/50">
        <div className="w-full lg:w-1/2 overflow-hidden relative">
          <div
            ref={influencerRef}
            className="flex gap-4 md:gap-6 py-5"
            style={{ transform: `translateX(-${influencerOffset}px)` }}
          >
            {[...influencers, ...influencers].map((item, i) => (
              <div
                key={i}
                className="min-w-[160px] md:min-w-[200px] bg-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-700"
              >
                <img
                  src={item.img}
                  className="h-48 md:h-60 w-full object-cover"
                />
                <div className="p-3 md:p-4">
                  <h4 className="font-bold text-sm md:text-base">
                    {item.name}
                  </h4>
                  <div className="bg-yellow-400 text-black text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 md:mt-2">
                    {item.category}
                  </div>
                  <p className="text-[8px] md:text-[10px] text-slate-400 mt-1 md:mt-2 italic">
                    📸 {item.followers} followers
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-slate-800 p-8 md:p-12 rounded-[30px] md:rounded-[40px] border border-slate-700 shadow-xl text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Vistafluence For <br /> Influencers
          </h2>
          <p className="text-slate-400 text-sm md:text-base mb-6 md:mb-8">
            Join the fastest growing Influencers community and Get Sponsorships
            from Brands to Monetise Your Content.
          </p>
          <button className="neno-button shadow-xl bg-fuchsia-700 hover:shadow-fuchsia-800/50 text-white hover:bg-fuchsia-700 border-fuchsia-700 transition w-full md:w-auto border-2  px-8 py-3 rounded-full font-bold">
            Join Now
          </button>
        </div>
      </div>

      {/* BRANDS SECTION */}
      <div className="flex flex-col lg:flex-row-reverse items-center px-4 md:px-10 py-10 md:py-16 gap-10">
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="flex gap-4 overflow-hidden w-full py-6 md:py-10">
            <div
              ref={brandRef}
              className="flex gap-6 md:gap-10 items-center"
              style={{ transform: `translateX(-${brandOffset}px)` }}
            >
              {[...brands, ...brands].map((logo, i) => (
                <div
                  key={i}
                  className="bg-white/5 p-4 md:p-6 rounded-full border border-slate-700 backdrop-blur-sm min-w-[80px] md:min-w-[100px]"
                >
                  <img
                    src={logo}
                    className="w-8 h-8 md:w-12 md:h-12 object-contain brightness-0 invert opacity-70"
                  />
                </div>
              ))}
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-400">
            1200+ Brands
          </h3>
        </div>

        <div className="w-full lg:w-1/2 bg-slate-800 p-8 md:p-12 rounded-[30px] md:rounded-[40px] border border-slate-700 shadow-xl text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Vistafluence For <br /> Brands
          </h2>
          <p className="text-slate-400 text-sm md:text-base mb-6 md:mb-8">
            Find the most Felicitous Influencers for Your Brand Promotion and
            Reach Your Target Audience WorldWide.
          </p>
          <button className="neno-button shadow-xl bg-fuchsia-700 hover:shadow-fuchsia-800/50 text-white hover:bg-fuchsia-700 border-fuchsia-700 transition w-full md:w-auto border-2  px-8 py-3 rounded-full font-bold ">
            Promote Now
          </button>
        </div>
      </div>

      {/* ARTICLES & NEWS (Split View) */}
      <div className="grid lg:grid-cols-2 gap-6 md:gap-10 px-4 md:px-10 py-10 md:py-16">
        {/* Article Card */}
        <div className="bg-white text-slate-900 rounded-[30px] md:rounded-[40px] p-2 flex flex-col sm:flex-row overflow-hidden border border-slate-700">
          <div className="w-full sm:w-1/2 relative min-h-[200px] md:min-h-[250px]">
            <img
              src={articles[articleIndex].img}
              className="absolute inset-0 w-full h-full object-cover rounded-[25px] md:rounded-[35px]"
              alt="article"
            />
            <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold uppercase">
              {articles[articleIndex].tag}
            </span>
          </div>
          <div className="w-full sm:w-1/2 p-6 md:p-8 bg-slate-800 text-white rounded-[25px] md:rounded-[35px] m-1 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Latest Articles
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mb-6">
              Access the latest insights from the industry.
            </p>
            <button className="w-full sm:w-fit border neno-button shadow-xl hover:shadow-fuchsia-800/50 bg-fuchsia-700 text-white hover:bg-fuchsia-700 border-fuchsia-700 transition  px-6 py-2 rounded-full text-xs md:text-sm font-bold">
              Read More
            </button>
          </div>
        </div>

        {/* News Card */}
        <div className="bg-slate-800 rounded-[30px] md:rounded-[40px] p-6 md:p-10 flex flex-col sm:flex-row items-center border border-slate-700 gap-6 md:gap-8 ">
          <div className="w-full sm:w-1/2 text-center sm:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Trending News
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mb-6">
              Find hot news in the influencer world.
            </p>
            <button className="neno-button shadow-xl hover:shadow-fuchsia-800/50 bg-fuchsia-700 text-white hover:bg-fuchsia-700 border-fuchsia-700 transition w-full sm:w-fit border px-6 py-2 rounded-full text-xs md:text-sm font-bold ">
              Access News
            </button>
          </div>
          <div className="w-full sm:w-1/2 relative h-[200px] md:h-[250px]">
            {news.map((item, i) => (
              <div
                key={i}
                className={`absolute inset-0 bg-white text-slate-900 rounded-2xl overflow-hidden shadow-xl transition-all duration-500 transform ${i === newsIndex ? "translate-y-0 opacity-100 scale-100 z-20" : "translate-y-4 opacity-0 scale-95 z-10"}`}
              >
                <img
                  src={item.img}
                  className="h-24 md:h-32 w-full object-cover"
                />
                <p className="p-3 md:p-4 text-[10px] md:text-xs font-medium leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FINAL SECTION */}
      <div className="px-4 md:px-10 pb-20">
        <div className="bg-slate-800 rounded-[30px] md:rounded-[50px] p-8 md:p-20 flex flex-col lg:flex-row items-center gap-10 border border-slate-700 relative overflow-hidden">
          <div className="w-full lg:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3"
              className="rounded-2xl md:rounded-3xl shadow-2xl w-full"
              alt="spot"
            />
          </div>
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              All in one spot
            </h2>
            <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-10 leading-relaxed">
              Vistafluence provides a holistic platform for Influencers and
              Brands to connect transparently.
            </p>
            <button className=" neno-button shadow-xl hover:shadow-fuchsia-800/50 bg-fuchsia-700 text-white hover:bg-fuchsia-700 border-fuchsia-700 transition w-full md:w-auto px-10 py-4 rounded-2xl font-black text-lg ">
              Get Onboard
            </button>
          </div>
        </div>
      </div>

      {/* VIDEO MODAL */}
      {showVideo && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <button
              className="absolute top-2 right-4 text-white text-3xl z-10 font-light"
              onClick={() => setShowVideo(false)}
            >
              &times;
            </button>
            <div className="aspect-video w-full">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                className="w-full h-full"
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default Home;
