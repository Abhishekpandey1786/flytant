import React from "react";
import PageHeader from "./PageHeader";
import { FaBullseye, FaHandsHelping, FaRocket } from "react-icons/fa";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <PageHeader />
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">

        <header className="text-center my-12 md:my-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white  drop-shadow-lg">
            Our Story, Our Mission
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            InfluZone  is where <span className="text-fuchsia-400">creativity meets opportunity</span>.  
            We empower meaningful connections between brands and influencers, building bridges that matter.
          </p>
        </header>

        {/* Grid Sections */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          {/* Mission Section */}
          <section className="bg-slate-800/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-2xl border border-fuchsia-700 hover:shadow-fuchsia-500/30 hover:scale-[1.03] transition-transform duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <FaBullseye className="text-white text-3xl group-hover:rotate-12 transition-transform" />
              <h3 className="text-3xl font-bold">Our Mission</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-base md:text-lg">
              InfluZone  was founded with a simple mission: to{" "}
              <span className="text-fuchsia-400 font-semibold">empower creators and brands</span>{" "}
              by providing a seamless platform to connect, collaborate, and grow.  
              We believe in the power of authentic partnerships that drive{" "}
              <span className="text-fuchsia-400 font-semibold">real results</span> and foster lasting communities.
            </p>
          </section>

          {/* What We Do Section */}
          <section className="bg-slate-800/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-2xl border border-fuchsia-700 hover:shadow-fuchsia-500/30 hover:scale-[1.03] transition-transform duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <FaHandsHelping className="text-white text-3xl group-hover:scale-110 transition-transform" />
              <h3 className="text-3xl font-bold">What We Do</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-base md:text-lg">
              We provide tools for both influencers and brands.  
              <span className="text-fuchsia-400 font-semibold">Influencers</span> can discover and apply for campaigns, while{" "}
              <span className="text-fuchsia-400 font-semibold">brands</span> find the perfect creators to tell their story.  
              From campaign creation to real-time performance tracking, we make the process{" "}
              <span className="text-fuchsia-400 font-semibold">simple and impactful</span>.
            </p>
          </section>
        </div>

        {/* Story Section */}
        <section className="mt-12 md:mt-16 bg-slate-800/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-2xl border border-fuchsia-700 hover:shadow-fuchsia-500/30 hover:scale-[1.02] transition-transform duration-300 group">
          <div className="flex items-center gap-3 mb-4">
            <FaRocket className="text-white text-3xl group-hover:-translate-y-1 transition-transform" />
            <h3 className="text-3xl font-bold">Our Story</h3>
          </div>
          <p className="text-gray-300 leading-relaxed text-base md:text-lg">
            Launched in <span className="text-fuchsia-400 font-semibold">2025</span>, InfluZone  has grown into a thriving marketplace for digital collaborations.  
            We are a passionate team of creators and marketers committed to building a{" "}
            <span className="text-fuchsia-400 font-semibold">fair and transparent</span> ecosystem.  
            With community at our core, we continuously innovate to support our users’ growth and success.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
