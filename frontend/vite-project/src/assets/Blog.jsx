import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "./PageHeader";

const blogPosts = [
  {
    id: 1,
    title: "The Ultimate Guide to Influencer Marketing in 2025",
    summary: "Discover the latest trends and strategies to make your campaigns a success this year...",
    link: "/blogs",
  },
  {
    id: 2,
    title: "How to Choose the Right Influencer for Your Brand",
    summary: "Finding the perfect match can be tricky. Learn what metrics and qualities to look for...",
    link: "/blogs",
  },
  {
    id: 3,
    title: "From Hobby to Profession: A Creator's Journey",
    summary: "We interview top creators on their path to becoming full-time influencers with InfluZone...",
    link: "/blogs",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PageHeader />
      <div className="max-w-4xl mx-auto p-15">
        <h2 className="text-4xl font-bold mb-6 text-center text-fuchsia-400">Our Blog</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-slate-800 p-6 rounded-xl shadow-lg border-2 border-fuchsia-800 transition hover:scale-105">
              <h3 className="text-2xl font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-400 mb-4">{post.summary}</p>
              <Link to={post.link} className="text-fuchsia-400 hover:underline">
                Read More →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog; 