import React, { useState } from "react";
import axios from "axios";
import { Lock, ArrowRight, X } from "lucide-react";

// ------------------------------------------------------------------
// MODULE CONTENT
// Convention inside each `content` string:
//   "## Heading"   -> subheading
//   "• bullet"     -> list item
//   normal line    -> paragraph
// ------------------------------------------------------------------
const modules = [
  {
    id: 1,
    title: "How to Become an Influencer",
    desc: "Who influencers are, and the 7 core steps to get started.",
    content: `## Who is an Influencer?
Influencers are people who have a large following on social media and can influence their followers' thoughts, actions, and habits. They produce material on specific areas like fitness, technology, fashion, gaming, business, travel, education, and lifestyle.

Unlike traditional superstars, influencers frequently earn fame by constantly posting meaningful, amusing, or instructional content online. They create communities based on common interests and communicate directly with their fans via comments, messages, livestreams, and postings.

## How to be an Influencer
Many people become influencers to:
• Share their knowledge and experiences
• Build a personal brand
• Create business opportunities
• Earn income through sponsorships and partnerships
• Inspire and educate others
• Gain freedom and flexibility in their careers

## Step 1: Choose Your Niche
A niche is the main topic of your content. Successful influencers usually focus on a specific area rather than posting about everything.
Popular niches include:
• Health and fitness
• Personal finance
• Technology
• Fashion and beauty
• Travel
• Food and cooking
• Gaming
• Education
• Entrepreneurship

## Step 2: Understand the Specific Needs of Your Target Audience
Ask yourself:
• Who do I plan to help?
• What problems am I able to solve?
• What questions do people often ask about my topic?

## Step 3: Create and Optimize Your Profile
A strong profile includes:
• A clear profile picture
• A simple and professional username
• A professional bio
• A call-to-action

## Step 4: Create Valuable Content Consistently
Focus on content that educates, entertains, inspires and solves problems. Post regularly and keep improving.

## Step 5: Engage with Your Audience
Respond to comments, DMs, questions and community discussions. Influence comes from relationships, not just follower counts.

## Step 6: Learn from Analytics
Track views, reach, engagement, watch time and shares. Double down on what performs best.

## Step 7: Build Authority
• Always share useful information
• Always be authentic
• Always show results and experiences
• Stay consistent over time

## Important Tip
Becoming an influencer is not about becoming famous overnight. It's about consistently creating valuable content, building trust, and developing expertise in a specific niche.`
  },

  {
    id: 2,
    title: "Beginner Influencer: How to Pick Your Niche",
    desc: "Finding the overlap between passion, knowledge and market demand.",
    content: `## Start With What You Enjoy
Choosing a niche starts with looking at what you naturally enjoy. Ask what topics you like learning, talking, or watching content about. A strong niche is something you can create content for regularly without losing interest.

## Research Audience Demand
Check whether people are actually interested in that topic on TikTok, Instagram and YouTube. Look at trending hashtags, popular videos and competitor accounts. Strong engagement from others signals real demand.

## The Three-Way Overlap
Choose a niche that combines:
• Passion — what you enjoy and can talk about consistently
• Knowledge — what you understand or have experience in
• Market demand — what people are actively searching for and consuming

If you only choose passion without demand, growth may be slow. If you choose demand without passion, you may burn out quickly.

## Examples of Strong Niches
• Fitness
• Personal finance
• Technology
• Travel
• Beauty
• Entrepreneurship

## Important Tip
Don't overthink your first niche. Many successful influencers start broad and refine their focus over time based on what content performs best.`
  },

  {
    id: 3,
    title: "Profile Optimization",
    desc: "Turning your profile into a digital business card.",
    content: `## Profile Photo
Select a high-quality image that clearly shows your face and represents your brand. Avoid unclear photos or distracting backgrounds.

## Your Bio Should Explain
• Who you help — your target audience
• What content you create — the main topics you cover
• Why people should follow you — the value you provide

## Call-to-Action (CTA)
Examples:
• Follow for daily tips
• Download my free guide
• Join my newsletter
• Watch my latest video
• Click the link below for more resources

## Links
Use your profile link strategically — point it to your website, store, newsletter or portfolio.

## Consistent Branding
Use the same profile picture, username, color scheme and messaging across all platforms so people recognize you everywhere.

## Example of an Optimized Bio
"Fitness Coach | Helping Busy Professionals Get Fit
🏋️ Simple workouts and nutrition tips
📈 Proven strategies for healthy living
👇 Follow for daily fitness advice"

## Important Tip
A well-optimized profile creates a strong first impression and increases the likelihood that visitors become loyal followers.`
  },

  {
    id: 4,
    title: "Getting Your First 10K Followers",
    desc: "The proven tactics that compound into real growth.",
    content: `## Post Consistently
Set a realistic posting schedule and stick to it. Consistent publishing boosts visibility and gives algorithms more reasons to recommend your content.

## Focus on High-Quality Content
Every post should educate, entertain, inspire, or solve a problem. Quality content is more likely to be shared, expanding your reach.

## Use Short-Form Video
Keep videos concise, capture attention in the first few seconds, and encourage viewers to watch until the end.

## Engage With Your Audience
Reply to comments, answer questions, and join conversations. Followers support creators who make them feel heard.

## Collaborate With Other Creators
Partnering with creators in similar niches introduces your profile to new audiences — interviews, guest appearances, joint videos, live streams.

## Follow Trends Strategically
Adapt trends to fit your niche instead of copying them without purpose.

## Study Your Analytics
Watch views, watch time, engagement rate, shares and follower growth — then create more of what performs best.

## Build a Community, Not Just a Following
Encourage discussions and invite participation. A loyal community engages more and recommends your account to others.

## Final Tip
Your first 10,000 followers are earned through trust, value and consistency — rarely overnight.`
  },

  {
    id: 5,
    title: "Monetization",
    desc: "The main revenue streams available to influencers.",
    content: `## Brand Deals & Sponsorships
Companies pay influencers to promote products to their audience — posts, videos, reviews, livestreams, or long-term ambassador programs. Trust and engagement matter more than raw follower count.

## Affiliate Marketing
A unique referral link tracks purchases made by your followers, and you earn a commission. Works best when you genuinely use and trust the products.

## Your Own Products or Services
E-books, online courses, templates, guides, memberships, coaching, or design services. Higher profit margins and less reliance on algorithms or sponsors.

## Advertising Revenue
Platforms like YouTube pay based on views, audience demographics, content type and ad demand. Works best combined with other income streams.

## Subscriptions
Exclusive content, communities, or live sessions for paying followers — recurring revenue and deeper connection with your most loyal fans.

## Important Tip
Followers support influencers who are open, honest, and selective about what they recommend. Promoting low-quality products for short-term gain damages long-term credibility.`
  },

  {
    id: 6,
    title: "Brand Deals",
    desc: "How brands choose influencers, and how deals actually work.",
    content: `## How Brands Choose Influencers
• Niche — does your content match their product category?
• Engagement — comments, likes and shares often matter more than follower count
• Audience fit — do your followers match the brand's target customers?

## Types of Brand Deals
• A single sponsored post or video
• Long-term brand ambassador agreements
• Free products in exchange for content, especially early on

## Pricing Factors
Follower count, engagement rate, content quality, and platform all affect what you can charge. Many creators start with lower deals or free products to build a portfolio.

## Getting Deals
Build a media kit — a short document showing your audience numbers, content style and past performance. Reach out directly via email or DM, or use influencer marketing platforms.

## Trust Matters Most
Only endorse things you believe in. If followers sense a promotion is fake, your credibility and long-term growth suffer.`
  },

  {
    id: 7,
    title: "Pricing Strategy",
    desc: "How to price your content and negotiate with brands.",
    content: `## Engagement Over Followers
A creator with 5,000 highly engaged followers can often charge more than someone with 20,000 inactive ones. Interaction demonstrates real influence.

## Content Type Affects Price
A simple Instagram story typically costs less than a produced YouTube video. Usage rights (brands reusing your content in ads) should also raise your price.

## Niche Affects Price
Finance, tech and business niches often pay more due to the higher value of the products/services being promoted.

## Starting Out
Beginners often start with lower prices or free product exchanges to build a portfolio — but treat this as short-term. Once you have proof of performance, move to consistent pricing.

## Build Packages, Not Random Quotes
• Beginner package — one post
• Standard package — post + story
• Premium package — multi-platform campaign

## Important Tip
Charging too little undervalues your work and attracts low-quality clients. Charging too much too soon makes it harder to close deals. Let your pricing grow with your results.`
  },

  {
    id: 8,
    title: "Outreach Scripts",
    desc: "Templates for approaching brands directly instead of waiting.",
    content: `## Why Outreach Matters
Many creators wait for brands to find them. Strong influencers take the initiative and pitch collaborations directly.

## Initial Outreach Script
"Hello [Brand],
My name is [Your Name], and I am a content creator in the [Niche] space. I create content focused on [topic] and have built an engaged audience interested in topics related to your brand.
I have been following your company and believe your products would be valuable to my audience. I would love to discuss a potential collaboration.
Thank you for your time and consideration.
Best regards, [Your Name]"

## Follow-Up Script
"Hello [Brand],
I wanted to follow up regarding my previous message about a potential collaboration. I remain very interested in working together and believe there is a strong alignment between your brand and my audience.
Please let me know if you would like additional information, including audience insights or examples of my work.
Best regards, [Your Name]"

## Tips for Effective Outreach
• Personalize every message instead of sending generic templates
• Mention specific products or campaigns that interest you
• Keep messages short and professional
• Highlight the value you can provide to the brand
• Include links to your profiles or media kit
• Follow up politely if you don't hear back`
  },

  {
    id: 9,
    title: "Content Mastery",
    desc: "The building blocks behind consistently good content.",
    content: `## Understand Your Audience
Know who you're creating for and what they want to learn, experience, or achieve. Content that solves problems or answers questions performs best.

## Consistency
Regular content creation boosts visibility and builds trust — without sacrificing quality for quantity.

## Storytelling
People are naturally drawn to stories. Share your own struggles, wins and lessons learned to create emotional connection.

## Visual Presentation
Good lighting, clear audio, and clean editing noticeably improve how content performs, even without expensive gear.

## Audience Engagement
Polls, questions, and discussions tell the algorithm — and your audience — that your content is worth interacting with.

## Ongoing Learning
Trends and algorithms keep changing. Study what's working, check your metrics regularly, and experiment with new formats.`
  },

  {
    id: 10,
    title: "Viral Hooks",
    desc: "How to earn the first three seconds of attention.",
    content: `## Why Hooks Matter
People scroll past hundreds of posts a day. A strong hook is what earns you the rest of their attention.

## Curiosity Hooks
"Most people don't know this," "Here's the mistake everyone makes," "I wish I had learned this sooner."

## Problem-First Hooks
Open with a problem your audience already has: "Struggling to lose weight even though you exercise every day?"

## Specific Numbers & Results
"How I Gained 10,000 Followers in 30 Days," "5 Mistakes That Are Stopping Your Growth" — specifics feel credible and clear.

## Bold Claims (Backed Up)
"Everything you've been told about productivity is wrong." Bold claims must always be accurate — the content has to deliver on the promise.

## Example Hooks
• "Nobody talks about this…"
• "I wish I knew this sooner."
• "Stop doing this if you want to grow on social media."
• "Here's why most creators fail."
• "Three simple tips that changed everything for me."`
  },

  {
    id: 11,
    title: "Editing Tricks",
    desc: "Small edits that make a big difference in retention.",
    content: `## Cut the Dead Air
Remove pauses, filler words and repeated sentences. Short, well-paced videos generally perform better.

## Add Captions
Many people watch without sound. Captions keep the message clear and make content more accessible.

## Fast Cuts & Transitions
Vary camera angles, zoom in on key points, and switch between clips to keep pacing dynamic.

## Pattern Interrupts
A sudden change in sound or visuals — on-screen text, sound effects, a quick zoom — re-grabs attention every few seconds.

## Background Music
Sets the tone and adds energy, but should never overpower the speaker's voice.

## Color & Lighting
Small adjustments to brightness, contrast and color balance make content look noticeably more polished.

## Key Takeaway
Removing dead air, adding captions, using pattern interrupts, and cleaning up audio/video quality all boost watch time and reach.`
  },

  {
    id: 12,
    title: "Storytelling",
    desc: "Turning experience into content people remember.",
    content: `## The Hook
Start with something that grabs attention immediately: "I almost gave up on content creation after my first month."

## The Problem
Every good story needs a clear conflict — the challenge or struggle you faced. This is what keeps people watching.

## The Journey
Describe the steps you took to solve it, including the failures and turning points — not just the neat ending.

## The Result
Share measurable outcomes: followers gained, fitness improved, revenue earned. Real results build credibility.

## The Lesson + CTA
End with a clear takeaway and a call-to-action — comment, share, follow, or try the method yourself.

## Key Takeaway
Storytelling is how you build rapport with an audience — hook, problem, journey, result, lesson.`
  },

  {
    id: 13,
    title: "Script Templates",
    desc: "Reusable structures so you're never starting from a blank page.",
    content: `## Hook–Problem–Solution–CTA
Example:
• Hook: "Most creators make this mistake when posting videos."
• Problem: "They focus on getting more followers instead of improving watch time."
• Solution: "Create stronger hooks, keep your videos short, and provide value in every post."
• CTA: "Follow for more content creation tips."

## Storytelling Framework
Hook → Background → Challenge → Solution → Result → Lesson. Best for personal stories and building trust.

## Tips / List Format
Break content into numbered points — e.g. "Five Tips for Growing on Social Media." Easier to follow, higher completion rate.

## Product Review Template
Introduce a problem → present the product as the solution → show how it works → give an honest opinion → close with a recommendation or CTA.

## Key Takeaway
Templates keep you organized and consistent. Over time, adapt them to your own voice and personality.`
  }
];

// ------------------------------------------------------------------
// Parses the "## heading / • bullet / paragraph" convention above
// ------------------------------------------------------------------
const renderContent = (content) => {
  const lines = content.split("\n");
  const blocks = [];
  let bulletBuffer = [];

  const flushBullets = (key) => {
    if (bulletBuffer.length) {
      blocks.push(
        <ul key={`ul-${key}`} className="list-disc list-inside space-y-1 text-slate-300 text-sm mb-4 ml-1">
          {bulletBuffer.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      );
      bulletBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("## ")) {
      flushBullets(idx);
      blocks.push(
        <h4 key={idx} className="text-fuchsia-400 font-bold text-lg mt-6 mb-2 first:mt-0">
          {trimmed.replace("## ", "")}
        </h4>
      );
    } else if (trimmed.startsWith("• ")) {
      bulletBuffer.push(trimmed.replace("• ", ""));
    } else {
      flushBullets(idx);
      blocks.push(
        <p key={idx} className="text-slate-300 text-sm leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    }
  });
  flushBullets("end");
  return blocks;
};

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------
const Academy = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

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
          <p className="text-slate-400 text-lg max-w-2xl">Work through the modules below, in order or however you like.</p>
        </header>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => setSelectedModule(mod)}
              className="group relative p-8 bg-slate-900/40 border border-white/5 rounded-[2rem] hover:bg-slate-900/60 transition-all cursor-pointer hover:-translate-y-2 shadow-lg"
            >
              <div className="mb-6 p-3 bg-slate-800 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                <span className="text-fuchsia-400 font-mono text-sm font-bold">
                  {String(mod.id).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-fuchsia-400 transition-colors">{mod.title}</h3>
              <p className="text-slate-400 text-sm mb-6">{mod.desc}</p>
              <div className="flex items-center text-xs font-bold uppercase tracking-widest text-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Open Module <ArrowRight size={14} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- MODULE VIEWER MODAL --- */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedModule(null)}></div>

          <div className="relative z-10 bg-slate-900 border border-white/10 w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-fuchsia-500 uppercase tracking-widest">Module {String(selectedModule.id).padStart(2, "0")}</span>
                <h3 className="text-2xl font-bold text-white">{selectedModule.title}</h3>
              </div>
              <button onClick={() => setSelectedModule(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="text-white" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {renderContent(selectedModule.content)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academy;