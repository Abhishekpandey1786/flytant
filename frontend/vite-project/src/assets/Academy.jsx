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
Influencers are people who have a large following on social media and can influence their followers' thoughts, actions, and habits. They produce material on specific areas like fitness, technology, fashion, gaming, business, travel, education, and lifestyle. Influencers can inspire individuals to try things, develop new skills, or adopt specific behaviors because their audience trusts their knowledge, experiences, and suggestions.
Unlike traditional superstars, influencers frequently earn fame by constantly posting meaningful, amusing, or instructional content online. They create communities based on common interests and communicate directly with their fans via comments, messages, livestreams, and postings.
Influencers can be found on various sites, including Instagram, TikTok, YouTube, Facebook, and LinkedIn.

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

To be a successful influencer, you need to choose a niche that is made up of the following aspects:
 • Your interests.
 • Your knowledge or experience.
 • The specific demands of your audience.



## Step 2: Understand the Specific Needs of Your Target Audience
As an influencer, you should ask yourself the following questions:
 • Who do I plan to help?
 • What problems am I able to solve?
 • What questions do people often ask about my topic?
When you better you understand your audience, it becomes easier to create the content that they want to watch. When people find their content, they will frequent your page and this will help grow your profile. 
As an influencer, your target should be helping your audience solve their problems by offering advice where they need, solutions when they need it, advice, among other things that relate to the needs of your audience. 


## Step 3: Create and Optimize Your Profile
Your profile should immediately tell visitors:
• Who you are as an influencer.
• The type of content you create.
• Why they should follow you.

##A strong profile includes:
• A clear profile picture.
• A simple and professional username.
•	A professional bio.
•	A call-to-action.
Example bio:
“Teaching you how I grow in Instagram | Influencer strategies, content ideas, and monetization tips | Join my journey.”

## Step 4: Create Valuable Content Consistently
	Consistency is one of the biggest assets for an influencer. 
To become a successful influencer, you should focus on creating content that:
 	Educates.
 	Entertains.
 	Inspires.
 	Solves problems.
	Remember to post regularly, and to improve with each content you post.

## Step 5: Engage with Your Audience
	It is important to understand that influence comes from relationships, and not just follower counts. People follow creators who make them feel heard and valued.
As such, you ought to respond to:
 	Comments. 
 	Direct messages. 
 	Questions. 
 	Community discussions. 

## Step 6: Learn from Analytics
You should track your:
 	Views. 
 	Reach.
 	Engagement.
 	Watch time. 
 	Shares.
	As an influencer, make sure you analyze your best-performing content and create more of what your audience enjoys. 

## Step 7: Build Authority
To become a trusted influencer in your niche:
 	Always share useful information.
 	Always be authentic.
 	Always show results and experiences.
 	Stay consistent over time.
Trust is the foundation of influence.
Important Tip:
Becoming an influencer is not about becoming famous overnight. It is about consistently creating valuable content, building trust with your audience, and developing expertise in a specific niche. Most influencers who succeed focus on helping people, solving problems, and showing up consistently over time.
` },

  {
    id: 2,
    title: "Beginner Influencer: How to Pick Your Niche",
    desc: "Finding the overlap between passion, knowledge and market demand.",
    content: `## Start With What You Enjoy
Social media has changed how individuals communicate, learn, and share knowledge. One of the most significant trends in the digital age is the rise of influencers. An influencer is someone who generates content for social media platforms with the power to impact their followers' thoughts, decisions, or actions. Unlike typical superstars who become famous through movies, television, or sports, as an influencer you frequently grow your audience by continuously posting material about a specific topic or interest. You build trust with your audience and community around similar interests by demonstrating your expertise, charisma, and sincerity.
Many people want to be influencers because it allows them to express themselves creatively, build their own brand, network, and make money. However, becoming a great influencer entails far more than just uploading photographs or videos online. It requires strategic thought, constant effort, and a clear grasp of the audience you want to target. For newcomers, the path begins with selecting a topic, setting up a professional profile, and providing excellent material that attracts and engages followers.
The first step toward becoming an influencer is to choose a specialty. A niche is the specialized subject area on which a content provider focuses. Popular areas include fitness, fashion, beauty, technology, personal finance, travel, gaming, education, and entrepreneurship. Choosing a niche is vital since it allows you to attract a certain audience that are interested in a particular issue. As a beginner, you should choose a niche that comprises of your interests, abilities, and knowledge with the needs of your audience. Creating content about something you truly enjoy makes it simpler to stay motivated and consistent over time.
Once you have determined your niche, profile optimization follows. A social media profile serves as your digital introduction and should clearly explain your identity and the value you offer. A strong profile often contains a professional profile photo, an easy-to-remember username, and a brief bio that describes your account's purpose. Your bio should inform visitors about the types of content they may expect and urge them to follow your account. A well-organized profile builds credibility and makes visitors become followers.
Content creation is the cornerstone of influencer development. Successful influencers provide material that educates, entertains, inspires, or solves problems for their target audience. High-quality content boosts engagement and raises the likelihood of followers sharing it with others. Beginners should focus on consistency rather than perfection, aiming to post on a regular basis while always developing their talents. Consistent content creation promotes audience trust and enhances visibility on social media platforms.
Engaging with your followers is another important facet of becoming an influencer. Responding to comments, questions, and discussions helps to strengthen ties with your audience. Social media is intended to be participatory, and followers are more willing to support producers who engage with them directly. Building a loyal group is frequently more valuable than accumulating a huge number of followers.
Finally, becoming an influencer requires commitment, consistency, and a willingness to add value to others. Beginners can lay a solid basis for development by focusing on a specialty, optimizing their profile, providing quality material, and engaging with their followers. Although success does not happen overnight, people who are steady and committed to serving their audience can steadily increase their impact and generate important opportunities on social media.

## How to Pick Your Niche
## Identify topics you enjoy and can consistently create content about.
Choosing a niche starts with looking at what you naturally enjoy. Ask yourself what topics you like learning, talking, or watching content about. A strong niche should be something you can create content for regularly without losing interest or motivation. Consistency is very important for growing as an influencer, so passion plays a big role in long-term success.
## Research audience demand using social media trends and search tools.
After identifying your interests, check whether people are actually interested in that topic. You can do this by exploring social media platforms like TikTok, Instagram, and YouTube. Look at trending hashtags, popular videos, and competitor accounts. If many people are engaging with similar content, it means there is strong audience demand. A good niche has both interest and active engagement from viewers.
 ## Choose a niche that combines:
Passion: What you enjoy and can talk about consistently
Knowledge: What you understand or have experience in
Market demand: What people are actively searching for and consuming
When these three overlap, you will have a strong foundation for growth. If you only choose passion without demand, growth may be slow. If you choose demand without passion, you may burn out quickly.
## Examples:
Here are some common niches that work well for beginners and experienced creators:
 	Fitness.
 	Personal finance.
 	Technology.
 	Travel.
 	Beauty.
 	Entrepreneurship.
Each of these niches has large audiences, strong engagement, and opportunities for monetization through brand deals, sponsorships, and product promotion.
Important Tip:
Don’t overthink your first niche. Many successful influencers start broad and refine their focus over time based on what content performs best. The most important step is to start creating and learn from real audience feedback.
`},

  {
    id: 3,
    title: "Profile Optimization",
    desc: "Turning your profile into a digital business card.",
    content: `
##	Use a clear profile photo.
Your profile photo is frequently the first thing people notice when they visit your account. Select a high-quality image that clearly shows your face and represents your own brand. Avoid using unclear photos, distracting backdrops, or anything that make it harder for visitors to identify you. A professional and approachable profile photo fosters trust and encourages others to follow your account.
 ## Create a bio that explains:
Your bio should instantly inform visitors about who you are, the type of material you publish, and why they should follow you. People often spend only a few seconds considering whether or not to follow an account, so your bio should be succinct, informative, and simple to comprehend.
 ## Who you help:
Determine who your target audience is. Inform visitors of the potential beneficiaries of your content. For instance, a business maker might assist entrepreneurs in expanding their enterprises, while a fitness creator might assist novices in improving their health.
## What content you create
Explain the main topics you cover. This helps visitors determine whether your content matches their interests and expectations.


## Why people should follow you:
Highlight the value you provide. Tell visitors what they will gain by following your account, such as tips, tutorials, inspiration, or industry insights.
Include a strong call-to-action (CTA):
A call-to-action encourages visitors to take the next step. Examples include:
 	Follow for daily tips.
 	Download my free guide.
 	Join my newsletter.
 	Watch my latest video.
 	Click the link below for more resources.
•	A clear CTA increases engagement and gives visitors a reason to interact with your content beyond simply viewing your profile.
•	Add links to your website, newsletter, or offers.
•	Most social media platforms allow creators to include a link in their profile. Use this space strategically by directing visitors to your website, online store, newsletter, portfolio, or other important resources. As your audience grows, these links can help generate leads, sales, and additional opportunities.
## Use consistent branding across platforms.
Consistency helps people recognize and remember your brand. Use the same profile picture, username, color scheme, logo, and messaging across all social media platforms whenever possible. Consistent branding creates a professional appearance and makes it easier for followers to find you on different platforms.
## Example of an Optimized Bio
Fitness Coach | Helping Busy Professionals Get Fit
🏋️ Simple workouts and nutrition tips
📈 Proven strategies for healthy living
👇 Follow for daily fitness advice
## Important Tip
Think of your profile as your digital business card. A well-optimized profile creates a strong first impression, communicates your value clearly, and increases the likelihood that visitors will become loyal followers. Taking time to improve your profile can significantly impact your growth as an influencer.
` },

  {
    id: 4,
    title: "Getting Your First 10K Followers",
    desc: "The proven tactics that compound into real growth.",
    content: `
As an influencer, you can monetize your content, audience, and personal brand. While many people start creating content as a pastime, effective influencers eventually figure out how to monetize their online presence. Monetization allows producers to be compensated for the time, effort, and value they contribute to their followers. However, successful monetization requires more than just a high number of followers. Brands and businesses are increasingly seeking influencers with engaged audiences, strong credibility, and the capacity to influence purchasing decisions.	
Brand agreements and sponsorships are among the most prevalent ways for influencers to make money. Companies work with influencers to sell products or services to their target consumers. These collaborations could include social media posts, videos, product evaluations, live broadcasts, or long-term ambassador programs. Brands desire to collaborate with influencers whose audiences closely match their target clients. As a result, creators should prioritize trust and engagement over just boosting follower numbers. A smaller audience with high engagement can often outperform a larger audience with little interaction.
Affiliate marketing is another common monetization strategy. Affiliate schemes provide influencers with a unique referral link that tracks purchases made by their followers. When someone purchases a product via that link, the influencer receives a commission. This strategy can give a consistent stream of passive revenue because authors earn as long as people use their links. Affiliate marketing works best when influencers advocate items they actually use and trust, as authenticity fosters audience trust.
Many influencers develop and market their own products or services. These could include digital products like e-books, online courses, templates, guides, or memberships. Others may provide advising, coaching, photography, graphic design, or other professional services connected to their field. Selling personal items frequently results in higher profit margins since creators have greater control over price and branding. Furthermore, it enables influencers to create a business that is not wholly reliant on social media algorithms or sponsorship agreements.
Advertising revenue is another source of income, especially for producers on platforms like YouTube. Content providers can profit from adverts that appear before, during, or after their videos. Views, audience demographics, content type, and advertising demand all have an impact on earning potential. While advertising revenue can grow significantly for large artists, it is typically most effective when combined with other monetization tactics.
Subscription-based approaches are becoming increasingly popular. Many sites include options for followers to pay for exclusive material, exclusive communities, live sessions, or other resources. This technique generates recurrent revenue and improves the bond between creators and their most devoted fans. Loyal fans are frequently willing to pay for premium content that adds value beyond what is provided publicly.
Successful monetization is dependent on keeping audience trust. Followers are more willing to support influencers who are open, honest, and selective about the things they recommend. Recommending low-quality products for short-term financial benefit might harm credibility and limit long-term earning potential. Influencers should target collaborations and opportunities that align with their personal brand and audience interests.
Finally, monetization enables influencers to turn content production into a viable career or business. Creators can earn money while providing value to their audiences by leveraging brand relationships, affiliate marketing, product sales, advertising revenue, and subscription programs. The most effective influencers prioritize trust, quality content, and numerous revenue streams. Influencers who combine sincerity with intelligent commercial decisions can create long-term financial opportunities and develop strong personal brands.
## Post Consistently
Consistency is one of the most crucial aspects of social media growth. Creators that provide new content on a regular basis are more likely to engage their followers. Set a reasonable blogging schedule and attempt to post frequently. Consistent publishing boosts your visibility and offers social media algorithms additional reasons to recommend your material to new audiences.
## Focus on High-Quality Content
Quality content attracts attention and encourages people to follow your account. Every post should educate, entertain, inspire, or solve a problem for your audience. Instead of focusing solely on quantity, prioritize creating content that provides value. High-quality content is also more likely to be shared, which can significantly expand your reach.
## Use Short-Form Video
Short-form videos have become one of the most effective ways to grow on social media platforms. Videos that are engaging, informative, and easy to consume often receive higher levels of reach and engagement. Keep videos concise, capture attention within the first few seconds, and encourage viewers to watch until the end.
## Engage With Your Audience
Social media is built on interaction. Respond to comments, answer questions, and participate in conversations with your followers. Audience engagement helps build trust and loyalty while signaling to platform algorithms that your content is valuable. Followers are more likely to support creators who make them feel heard and appreciated.
## Collaborate With Other Creators
Collaborations allow you to reach audiences that may not already know about your content. Partnering with creators in similar niches can increase exposure and introduce your profile to potential followers. Collaborations can include interviews, guest appearances, joint videos, live streams, or content challenges.
## Follow Trends Strategically
Trending topics, sounds, and challenges can help increase visibility when used appropriately. However, it is important to adapt trends to fit your niche rather than copying them without purpose. Combining trends with your unique perspective can help attract attention while maintaining authenticity.
## Study Your Analytics
Analytics provide valuable insights into what content performs best. Pay attention to metrics such as views, watch time, engagement rate, shares, and follower growth. Identify patterns among your highest-performing posts and create similar content. Data-driven decisions can accelerate growth and improve content effectiveness.
## Build a Community, Not Just a Following
Many creators focus only on gaining followers, but successful influencers focus on building communities. Encourage discussions, ask questions, and create content that invites participation. A loyal community is more likely to engage with your content, recommend your account to others, and support your future projects.
## Be Patient and Persistent
Growing to 10,000 followers rarely happens overnight. Most successful influencers spend months or years refining their content and learning what resonates with their audience. Consistency, continuous improvement, and patience are essential. Every post is an opportunity to learn, improve, and reach new people.
## Final Tip
Your first 10,000 followers are earned through trust, value, and consistency. Focus on helping your audience, creating quality content, engaging with your community, and learning from your results. By staying committed to the process and continuously improving, you can build a strong foundation for long-term growth and success as an influencer.`
  },

  {
    id: 5,
    title: "Monetization",
    desc: "The main revenue streams available to influencers.",
    content: `## Brand Deals & Sponsorships
As an influencer, you can monetize your content, audience, and personal brand. While many people start creating content as a pastime, effective influencers eventually figure out how to monetize their online presence. Monetization allows producers to be compensated for the time, effort, and value they contribute to their followers. However, successful monetization requires more than just a high number of followers. Brands and businesses are increasingly seeking influencers with engaged audiences, strong credibility, and the capacity to influence purchasing decisions.	
Brand agreements and sponsorships are among the most prevalent ways for influencers to make money. Companies work with influencers to sell products or services to their target consumers. These collaborations could include social media posts, videos, product evaluations, live broadcasts, or long-term ambassador programs. Brands desire to collaborate with influencers whose audiences closely match their target clients. As a result, creators should prioritize trust and engagement over just boosting follower numbers. A smaller audience with high engagement can often outperform a larger audience with little interaction.
Affiliate marketing is another common monetization strategy. Affiliate schemes provide influencers with a unique referral link that tracks purchases made by their followers. When someone purchases a product via that link, the influencer receives a commission. This strategy can give a consistent stream of passive revenue because authors earn as long as people use their links. Affiliate marketing works best when influencers advocate items they actually use and trust, as authenticity fosters audience trust.
Many influencers develop and market their own products or services. These could include digital products like e-books, online courses, templates, guides, or memberships. Others may provide advising, coaching, photography, graphic design, or other professional services connected to their field. Selling personal items frequently results in higher profit margins since creators have greater control over price and branding. Furthermore, it enables influencers to create a business that is not wholly reliant on social media algorithms or sponsorship agreements.
Advertising revenue is another source of income, especially for producers on platforms like YouTube. Content providers can profit from adverts that appear before, during, or after their videos. Views, audience demographics, content type, and advertising demand all have an impact on earning potential. While advertising revenue can grow significantly for large artists, it is typically most effective when combined with other monetization tactics.
Subscription-based approaches are becoming increasingly popular. Many sites include options for followers to pay for exclusive material, exclusive communities, live sessions, or other resources. This technique generates recurrent revenue and improves the bond between creators and their most devoted fans. Loyal fans are frequently willing to pay for premium content that adds value beyond what is provided publicly.
Successful monetization is dependent on keeping audience trust. Followers are more willing to support influencers who are open, honest, and selective about the things they recommend. Recommending low-quality products for short-term financial benefit might harm credibility and limit long-term earning potential. Influencers should target collaborations and opportunities that align with their personal brand and audience interests.
Finally, monetization enables influencers to turn content production into a viable career or business. Creators can earn money while providing value to their audiences by leveraging brand relationships, affiliate marketing, product sales, advertising revenue, and subscription programs. The most effective influencers prioritize trust, quality content, and numerous revenue streams. Influencers who combine sincerity with intelligent commercial decisions can create long-term financial opportunities and develop strong personal brands.
` },

  {
    id: 6,
    title: "Brand Deals",
    desc: "How brands choose influencers, and how deals actually work.",
    content: `## How Brands Choose Influencers
Brand deals are collaborations between influencers and businesses in which the influencer is compensated to promote a product or service to their target audience. Instead of depending solely on traditional advertising, corporations collaborate with creators since influencers already have the trust and attention of a specific group of people. This makes influencer marketing more personal and frequently more effective than traditional advertising.
	Brands typically select influencers based on three key criteria: niche, engagement, and audience match. The niche is important because businesses want to target consumers who are already engaged in a particular issue. For example, a fitness brand will choose fitness influencers, but a technology company may seek for creators who review goods. Engagement is also really crucial. A smaller influencer with frequent comments, likes, and shares can be more valuable than a massive account with little interaction. Finally, audience fit guarantees that the influencer's followers share the same age, interests, and geography as the brand's target clients.
	There are several forms of brand deals. Some collaborations are limited to a single sponsored post or video. Others are long-term agreements in which the influencer becomes a brand ambassador and promotes the firm for several months. In some situations, influencers may accept free things in return for content, particularly when they are first starting out.
Brand partnerships are priced based on a variety of parameters, including follower count, engagement rate, content quality and platform. Influencers with greater influence and engagement can charge more. Many newcomers begin with lower bargains or free products to gain experience and a portfolio before raising their prices.
Influencers typically must actively promote themselves in order to secure brand deals. This may include establishing a media kit, which is a short document that displays their audience figures, content style, and previous performance. Many influencers contact firms directly via email or social media messaging, while others use influencer marketing platforms to connect creators with companies.
Trust is one of the most crucial aspects of brand deals. Influencers should only endorse things they believe in, as their audience relies on their recommendations. If followers believe that promotions are phony or deceptive, the influencer's credibility and long-term growth potential may suffer.
Overall, brand partnerships are a valuable source of income for influencers, but they necessitate consistency, professionalism, and audience trust. Successful influencers prioritize real interaction, as strong relationships with followers are what make brand partnerships valuable in the first place.
` },

  {
    id: 7,
    title: "Pricing Strategy",
    desc: "How to price your content and negotiate with brands.",
    content: `## Engagement Over Followers
Influencer pricing strategy is the process of determining how much to charge for brand deals, content development, and promotional activity while remaining competitive in the market. There is no set fee for influencer work, especially for novices, because rates vary depending on criteria such as audience size, engagement rate, niche, content quality, and platform type.
One of the most prevalent methods for pricing influencers is based on their number of followers, but this is only the beginning. Today, brands prioritize interaction above numbers. An influencer with 5,000 highly engaged followers can typically charge more than someone with 20,000 inactive followers. This is because interaction (likes, comments, shares, and saves) demonstrates genuine influence over an audience.
Another major consideration in cost is the sort of material being produced. A basic Instagram story typically costs less than a high-quality YouTube video or professionally made clip. Longer, more sophisticated content that requires scripting, filming, and editing should be priced higher due to the additional time and talent required. Usage rights also influence pricing. If a brand wants to repurpose your material in advertisements or on their website, you should charge more because they are increasing the value of your work.
Niche also influences pricing approach. Some categories, such as finance, technology, and business, pay greater rates because to the higher value of their products and services. Lifestyle or entertainment niches may have more opportunities, but with lower average payments, depending on the brand and target audience.

Beginners frequently start with cheaper prices or even free product exchanges to gain expertise and establish a portfolio. However, this should only be a short-term plan. As soon as you have evidence of performance, such as high engagement, successful posts, or previous collaborations, you should start charging consistent prices.
Many influencers employ a basic strategy of setting a base cost per 1,000 followers and then modifying it based on engagement and effort. Others base their pricing on time, effort, and production quality. For example, a basic post may be less expensive than a comprehensive campaign package (many posts, stories, and videos).
It is also critical to have defined pricing bundles rather than random one-time costs. Packages make it easy for brands to comprehend what they are getting, increasing your chances of landing a sale. For example, you may provide a beginner package (one post), a standard package (post and story), and a premium package (multi-platform marketing).
Finally, good pricing strategy requires balancing justice and growth. Charging too little can undervalue your services and attract low-quality clients, whilst charging too much too soon can make it harder to negotiate deals. As your influence rises, your cost should rise to reflect your experience, outcomes, and audience effect.
`},

  {
    id: 8,
    title: "Outreach Scripts",
    desc: "Templates for approaching brands directly instead of waiting.",
    content: `## Why Outreach Matters
Hello Brand X,
My name is B D, and I am a content creator in the F G space. I create content focused on healthcare and successfully built an engaged audience that is interested in topics related to your brand.
I have been following your company and believe your products would be valuable to my audience. I would love to discuss a potential collaboration and explore ways we can work together.
Thank you for your time and consideration. I look forward to hearing from you.
Best regards,
B D


Follow-Up Script
Hello Brand X,
I hope you are doing well. I wanted to follow up regarding my previous message about a potential collaboration. I remain very interested in working together and believe there is a strong alignment between your brand and my audience.
Please let me know if you would like additional information, including audience insights or examples of my previous work.
Thank you for your time, and I look forward to your response.
Best regards,
B D
Tips for Effective Outreach
 	Personalize every message instead of sending generic templates.
 	Mention specific products or campaigns that interest you.
 	Keep messages short and professional.
 	Highlight the value you can provide to the brand.
 	Include links to your social media profiles or media kit.
 	Follow up politely if you do not receive a response.

## Key Takeaway
Outreach scripts are a valuable resource for influencers seeking brand relationships. Rather than waiting for opportunities to arise, creators can approach firms and present themselves as valued marketing partners. A professional, individualized message enhances the likelihood of a response and can lead to long-term collaborations that benefit both the influencer's brand and income.`
  },

  {
    id: 9,
    title: "Content Mastery",
    desc: "The building blocks behind consistently good content.",
    content: `## Understand Your Audience
Content mastery refers to the capacity to continuously produce high-quality material that captures attention, engages an audience, and motivates people to act. For influencers, content is the foundation of growth because it is the primary means of communicating with followers and developing their personal brand. Regardless of platform, great influencers recognize that creating good content entails more than just uploading photographs or videos. It entails recognizing the audience, providing value, and presenting information in a way that catches and retains attention.	
One of the most crucial parts of content expertise is understanding your audience. Influencers must understand who they are providing content for and what their audience wishes to learn, experience, or achieve. Content that solves problems, answers questions, or provides enjoyment is more likely to be successful. Before developing content, influencers should consider the value they offer and why someone would choose to watch, read, or connect with their content.
Consistency is another essential component of content mastery. Regular content creation boosts visibility on social media platforms and fosters trust with followers. Maintaining a dependable schedule while continuously improving material over time is what is meant by consistency, not compromising quality for quantity. Regular posters are more likely to maintain their relevance and forge closer bonds with their followers.
Another effective content talent is storytelling. Because stories foster emotional connection and make information simpler to recall, people are naturally drawn to them. To engage their audience, successful influencers frequently share their own struggles, triumphs, lessons learned, and personal experiences. A compelling narrative usually consists of a problem, a solution, and a valuable lesson for the audience.
Additionally, visual presentation has a significant impact on material performance. Excellent lighting, crisp audio, high-quality photos, and expert editing can all greatly enhance the viewing experience. Influencers should concentrate on producing visually beautiful and easily consumable content, even when pricey equipment is not always required. Content can look more credible and professional with minor production quality enhancements.
Another crucial component of content mastery is audience engagement. Effective content promotes engagement through debates, polls, questions, and comments. In addition to improving relationships with followers, engagement tells social media engines that the content is worthwhile. Influencers that regularly interact with their followers frequently create more robust groups and see greater levels of development.
Lastly, mastery of the material necessitates ongoing education and development. Algorithms, audience preferences, and social media trends are ever-evolving. Influencers should investigate successful authors, check metrics on a regular basis, and try out various content types. Creators may enhance their performance and sustain long-term success by evaluating what works and making changes.

To sum up, audience comprehension, consistency, storytelling, high-quality production, engagement, and ongoing improvement are all components of content mastery. Influencers can produce content that stands out in a crowded digital space because to their abilities. Influencers may expand their audiences, strengthen their communities, and provide more prospects for growth and revenue by becoming proficient content creators.
`},

  {
    id: 10,
    title: "Viral Hooks",
    desc: "How to earn the first three seconds of attention.",
    content: `## Why Hooks Matter
A viral hook is the first segment of a piece of material that draws viewers in and entices them to continue watching, reading, or listening. Influencers have only a few seconds to leave an impact because consumers on social media browse through hundreds of postings every day. A compelling hook piques viewers' interest enough to stay until the finish of the content by highlighting an issue, generating curiosity, or offering value. Even excellent content could be disregarded in the absence of a strong hook.
	Creating a viral hook by arousing curiosity is one of the best strategies. Naturally, people desire to learn new knowledge or find out the answer to an intriguing topic. Words like "Most people don't know this," "Here's the mistake everyone makes," or "I wish I had learned this sooner" entice viewers to keep watching in order to satiate their curiosity.
Finding a common issue and providing a remedy right away is another tactic. Viewers are more inclined to interact with content that solves their problems or advances their objectives. "Struggling to lose weight even though you exercise every day?" is how a fitness influencer would start. "Is your phone battery dying too quickly?" a tech developer might inquire. The artist engages the audience and inspires them to learn more by posing a topic that they can relate to.
Another effective hook is to use particular results and data. Titles like "How I Gained 10,000 Followers in 30 Days" and "5 Mistakes That Are Stopping Your Growth" make it obvious what viewers might anticipate learning. Specific numbers increase the likelihood that viewers will stick with a piece of material by making it seem more trustworthy and understandable.
Influencers can also draw attention with startling data, audacious claims, or unexpected viewpoints. Saying something like, "Everything you've been told about productivity is wrong," or "You don't need expensive equipment to create viral videos," for instance, challenges preconceived notions and invites viewers to find out why. However, in order to retain credibility, audacious assertions must always be accurate and backed up with useful data.
A good hook should be succinct, straightforward, and pertinent to the remainder of the text. Without making false or inflated claims, it should promptly explain to viewers why they should keep watching. Viewers may lose faith in the creator if the content doesn't live up to the hook's promise. As a result, the opening should appropriately convey the value offered throughout the post or video.
Examples of Viral Hooks
 	"Nobody talks about this..."
 	"I wish I knew this sooner."
 	"Stop doing this if you want to grow on social media."
 	"Here's why most creators fail."
 	"Three simple tips that changed everything for me."
 	"You are making this mistake without realizing it."
`
  },

  {
    id: 11,
    title: "Editing Tricks",
    desc: "Small edits that make a big difference in retention.",
    content: `## Cut the Dead Air
One of the most crucial abilities for producing interesting material on social media is editing. Effective editing enhances a video's flow, draws in viewers, and keeps them watching until the very end. Effective editing frequently has a bigger impact on material performance, even while top-notch cameras and equipment might enhance production. To make their films more engaging, polished, and simple to watch, successful influencers employ straightforward yet effective editing techniques.
Eliminating superfluous pauses and filler words is one of the best editing techniques. Errors, lengthy silences, and repeated sentences might make viewers lose interest and scroll away. Cutting these scenes speeds up the action and maintains the audience's attention on the primary point. 
Because they hold viewers' interest, short, well-paced videos typically do better on social media.
Adding captions or subtitles is another helpful method. A lot of individuals watch videos without sound, particularly when using social media in public. Even when the audio is muted, captions help viewers comprehend the message and make material accessible to a larger audience. Additionally, they enhance audience retention and highlight important themes.
To keep viewers interested, creators should also employ fast cuts and seamless transitions. Videos are kept from getting monotonous by varying camera angles, focusing in on significant points, or alternating between different clips. Without detracting from the primary idea, these editing strategies give information a more dynamic feel.

Another common editing technique is the use of pattern interrupts. A pattern interrupt is an abrupt change in sound or visuals that draws the audience back in. Adding text to the screen, utilizing sound effects, altering the background, adding pictures, or momentarily enlarging the speaker's face are a few examples. Every few seconds, a pattern interrupt keeps viewers interested and motivates them to keep watching.
The viewing experience can also be enhanced by background music. Videos feel more captivating when they are accompanied by music, which also establishes the tone and generates excitement. The speaker's voice shouldn't be overpowered by the music, though. Selecting music that complements the content's tone makes the audience's experience more polished and pleasurable.
Higher-quality videos can benefit from color correction and appropriate lighting. Clear, bright images give information a more polished, businesslike appearance. A video's overall image can be greatly enhanced by making even small changes to brightness, contrast, and color balance. Additionally, good lighting during filming minimizes the need for extensive post-production editing.
Lastly, influencers should always edit their videos before releasing them. Creators can spot errors, enhance pacing, and make sure the content conveys the intended message by watching the finished product. Even minor changes can have a big impact on how viewers react to the information.

## Key Takeaway
Effective editing transforms ordinary videos into interesting content that attracts and maintains viewers' interest. Influencers can improve the performance of their social media material by removing needless pauses, adding subtitles, employing short cuts, including pattern interrupts, and enhancing audio and video quality. Mastering these editing techniques boosts view duration, engagement, and the possibility of content reaching a wider audience.`
  },

  {
    id: 12,
    title: "Storytelling",
    desc: "Turning experience into content people remember.",
    content: `## The Hook
Storytelling is one of the most potent talents an influencer can have. Rather than simply giving information or advertising items, storytelling enables producers to engage with their audience on a more personal and emotional level. People are naturally drawn to stories because they are interesting, memorable, and relatable. A well-told tale has the power to captivate people's attention, develop trust, and encourage them to act. This is why many successful influencers build their content around storytelling.
	Effective storytelling starts with a compelling hook that grabs the audience's attention within the first few seconds. The start should pique viewers' interest, give a challenge, or introduce an intriguing scenario that motivates them to keep watching. For example, an influencer might begin by saying, "I almost gave up on content creation after my first month," which immediately piques the audience's interest in what happens next.
	Every great story involves a clear problem or conflict. This is the task, barrier, or struggle that the creator faced. The conflict keeps the audience engaged because they want to know how the situation will be resolved. Whether it's losing weight, establishing a business with limited funds, or conquering a fear of public speaking, relevant problems help listeners connect with the creative.

After presenting the issue, the influencer describes the steps taken to resolve it. This section presents the answer, strategy, or lesson learned. Instead of merely providing an answer, successful storytellers convey the journey, including failures, disappointments, and critical turning moments. This makes the story more authentic and credible, while also allowing the audience to grasp the process rather than just the conclusion.
The following section of the story focuses on the results. The sharing of measurable outcomes or personal successes proves the solution's effectiveness. For example, an influencer may discuss how a new method assisted them in gaining thousands of followers, improving their fitness, or expanding a profitable business. Including real results increases credibility and demonstrates to the audience that the advise is based on personal experience.
Every story should conclude with a valuable lesson or call to action. The lesson summarizes the major message and gives the listener something useful to remember. A call-to-action prompts visitors to leave comments, share their own experiences, follow the account, or attempt the suggested technique. Ending with a clear message improves engagement and fosters a closer relationship with followers.
Authenticity is vital for storytelling. Audiences respect creators who are open about their accomplishments and failings. Sharing personal experiences makes material more relatable and promotes trust. People are more likely to support influencers who appear authentic than those who exclusively show great situations.


## Key Takeaway
Storytelling is more than just telling a narrative; it is a method of developing rapport with an audience. Influencers may create content that attracts attention and creates a lasting impression by starting with a great hook, presenting a relevant problem, detailing the path, sharing meaningful results, and concluding with a useful lesson. Mastering narrative enables producers to boost engagement, build trust, and cultivate a dedicated community that will continue to support their material over time.`
  },

  {
    id: 13,
    title: "Script Templates",
    desc: "Reusable structures so you're never starting from a blank page.",
    content: `## Script templates
    Script templates give a standardized framework that allows influencers to create compelling and consistent content. Instead of creating each video from scratch, artists can use tried-and-true forms that help them organize ideas, communicate clearly, and keep viewers engaged. A strong script ensures that the information serves a clear purpose, flows naturally, and adds value to the audience. Although each creator has an own flair, the majority of good social media material adheres to a common format.
    One of the most popular templates is the Hook-Problem-Solution-Call-to-Action (CTA) pattern. The script opens with a strong hook that captures the audience's attention in the first few seconds. It then introduces an issue that the audience can identify with before giving a viable solution. Finally, the author includes a call-to-action, asking visitors to like, comment, share, or follow for future material.
Example:
 	Hook: "Most creators make this mistake when posting videos."
 	Problem: "They focus on getting more followers instead of improving watch time."
 	Solution: "Create stronger hooks, keep your videos short, and provide value in every post."
 	CTA: "Follow for more content creation tips."
The Storytelling Framework is an effective template that follows the hook, background, challenge, solution, result, and lesson sequence. This style is ideal for sharing personal stories and establishing trust with an audience. Instead of merely offering advise, influencers describe how they confronted an issue, overcame it, and learnt from the experience. Personal stories frequently result in greater emotional ties and increased engagement.
	For instructive content, influencers frequently utilize the Tips or List Format. This design breaks down information into numbered points, making it easier for viewers to follow. For example, a creator could provide "Five Tips for Growing on Social Media" or "Three Mistakes New Influencers Should Avoid." Breaking content down into clear portions improves comprehension and increases the likelihood that viewers will stay until the conclusion.
The Product Review Template is another common structure for influencers that collaborate with firms. It starts by introducing a common problem, then presents the product as a solution. The creator shows how the product works, analyzes its benefits, and expresses an honest view before concluding with a recommendation or call to action. Authentic reviews promote trust and informed purchasing decisions.
Regardless of the template chosen, each script should be clear, succinct, and audience-oriented. Avoid superfluous information and keep the message concise. Before filming, influencers should practice their script to boost confidence and ensure a smooth delivery. As designers gain experience, they can tailor these templates to their individual personalities and communication styles.


## Storytelling Framework
Hook → Background → Challenge → Solution → Result → Lesson. Best for personal stories and building trust.

## Tips / List Format
Break content into numbered points — e.g. "Five Tips for Growing on Social Media." Easier to follow, higher completion rate.

## Product Review Template
Introduce a problem → present the product as the solution → show how it works → give an honest opinion → close with a recommendation or CTA.

## Key Takeaway
Script templates make content creation easier by offering a proven structure for videos and blogs. Whether providing instructive content, sharing personal tales, or reviewing products, having a template allows influencers to stay organized, communicate effectively, and consistently produce interesting content. Over time, these templates become useful tools for boosting content quality, increasing audience engagement, and promoting long-term social media growth.`
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