// routes/notifications.js (या admin.js में verifyAdmin के बिना एक नया GET रूट)

const router = require("express").Router();
const Notification = require("../models/Notification"); // सुनिश्चित करें कि यह सही इम्पोर्ट है

// यह रूट पब्लिक होगा और इसे कोई भी एक्सेस कर सकता है (कोई मिडलवेयर नहीं)
router.get("/notifications", async (req, res) => {
    try {
        // डेटाबेस से सभी नोटिफिकेशन फ़ेच करें
        const notifications = await Notification.find()
            // optionally, एडमिन-स्पेसिफिक फ़ील्ड्स (जैसे isRead, जिसे यूज़र-लेवल पर ट्रैक किया जाना चाहिए) को न दिखाएँ
            .select("title message image link createdAt") 
            .sort({ createdAt: -1 });
            
        res.status(200).json(notifications);
    } catch (err) {
        console.error("Public notification fetch error:", err);
        res.status(500).json({ error: "Server error fetching notifications" });
    }
});

module.exports = router;