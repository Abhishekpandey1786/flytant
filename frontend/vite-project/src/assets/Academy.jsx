import React, { useState } from "react";

const coursesData = [
  {
    title: "Beginner Course",
    desc: "Start your influencer journey from scratch.",
    videos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    pdfs: ["/pdfs/beginner.pdf"],
    color: "from-pink-500 to-purple-500",
  },
  {
    title: "Advanced Growth",
    desc: "Scale your audience and earn big brand deals.",
    videos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    pdfs: ["/pdfs/advanced.pdf"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Trending Content Ideas",
    desc: "Daily viral hooks & trending formats.",
    videos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    pdfs: ["/pdfs/trending.pdf"],
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "Tools & Services",
    desc: "Editing, thumbnails & growth tools.",
    videos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    pdfs: ["/pdfs/tools.pdf"],
    color: "from-green-500 to-emerald-500",
  },
];

function Academy() {
  const [activeCourse, setActiveCourse] = useState(null);

  return (
    <div className="bg-slate-950 text-white min-h-screen px-6 md:px-16 py-12">
      
      {/* HEADER */}
      <h1 className="text-4xl md:text-6xl font-black mb-12 text-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
        Vistafluence Academy
      </h1>

      {/* COURSE GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {coursesData.map((course, index) => (
          <div
            key={index}
            onClick={() => setActiveCourse(course)}
            className="group cursor-pointer relative p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:scale-105 transition duration-300 overflow-hidden"
          >
            {/* Gradient Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-20 transition`} />

            <h2 className="text-xl font-bold mb-3">{course.title}</h2>
            <p className="text-sm text-slate-400">{course.desc}</p>

            <div className="mt-6 text-xs text-fuchsia-400 font-bold">
              Explore →
            </div>
          </div>
        ))}

      </div>

      {/* COURSE MODAL */}
      {activeCourse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          
          <div className="bg-slate-900 w-full max-w-4xl rounded-3xl p-6 border border-white/10 relative">

            {/* CLOSE */}
            <button
              className="absolute top-4 right-5 text-3xl"
              onClick={() => setActiveCourse(null)}
            >
              ×
            </button>

            <h2 className="text-3xl font-bold mb-4">
              {activeCourse.title}
            </h2>

            {/* VIDEOS */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {activeCourse.videos.map((vid, i) => (
                <iframe
                  key={i}
                  src={vid}
                  className="w-full h-56 rounded-xl"
                  allow="autoplay"
                />
              ))}
            </div>

            {/* PDFs */}
            <div className="flex flex-wrap gap-4">
              {activeCourse.pdfs.map((pdf, i) => (
                <a
                  key={i}
                  href={pdf}
                  target="_blank"
                  className="px-6 py-2 bg-fuchsia-600 rounded-full hover:bg-fuchsia-700 transition font-bold text-sm"
                >
                  📄 View PDF {i + 1}
                </a>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Academy;