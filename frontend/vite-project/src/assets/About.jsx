import React from "react";
import PageHeader from "./PageHeader";
import { FaBullseye, FaHandsHelping, FaRocket } from "react-icons/fa";
import Footer from './Footer'
const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <PageHeader />
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">

        <header className="text-center my-12 md:my-16 ">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white drop-shadow-lg">
            Our Story, Our Mission
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We are building a <span className="text-fuchsia-400">transparent ecosystem</span> where influencers and brands collaborate directly — <span className="text-fuchsia-400">without agencies, without hidden cuts.</span>
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <section className="bg-slate-800/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-2xl hover:scale-[1.03] transition-transform duration-300 group neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 border-fuchsia-800">
            <div className="flex items-center gap-3 mb-4">
              <FaBullseye className="text-white text-3xl group-hover:rotate-12 transition-transform" />
              <h3 className="text-3xl font-bold">Our Mission</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-base md:text-lg">
              Our mission is to empower creators not just to earn, but to{" "}
              <span className="text-fuchsia-400 font-semibold">learn, grow, and build sustainable digital careers</span>. 
              We believe in providing the tools and transparency needed for creators to take full control of their professional journey.
            </p>
          </section>

          <section className="bg-slate-800/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-2xl hover:scale-[1.03] transition-transform duration-300 group neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 border-fuchsia-800">
            <div className="flex items-center gap-3 mb-4">
              <FaHandsHelping className="text-white text-3xl group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-bold">What We Do</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-base md:text-lg">
              We provide a platform where <span className="text-fuchsia-400 font-semibold">brands and influencers connect directly</span>. 
              By removing middlemen, we ensure that brands find authentic voices and influencers keep 100% of what they earn, making the process <span className="text-fuchsia-400 font-semibold">fair and impactful</span>.
            </p>
          </section>
        </div>

        <section className="mt-12 md:mt-16 bg-slate-800/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-2x1 hover:scale-[1.02] transition-transform duration-300 group neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 border-fuchsia-800">
          <div className="flex items-center gap-3 mb-4">
            <FaRocket className="text-white text-3xl group-hover:-translate-y-1 transition-transform" />
            <h3 className="text-3xl font-bold">Our Story</h3>
          </div>
          <p className="text-gray-300 leading-relaxed text-base md:text-lg">
            Launched in <span className="text-fuchsia-400 font-semibold">2025</span>, Vistafluence was born out of a need for honesty in the influencer marketing space. 
            We are a team of creators committed to building a <span className="text-fuchsia-400 font-semibold">direct-to-brand</span> ecosystem. 
            By focusing on growth and education, we help our community succeed in a changing digital world.
          </p>
        </section>
      </div>
      <Footer/>
    </div>
  );
};

export default About;