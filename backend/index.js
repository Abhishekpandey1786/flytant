const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db"); // Yahan `connectDB` file ka path sahi kar lena

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const campaignRoutes = require("./routes/campaigns"); // campaigns route ko bhi variable mein store karein

dotenv.config();

const app = express();

// ✅ Sabse pehle middleware ko define karein
app.use(cors());
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Database connection
connectDB();


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/upload/campaign_images", express.static(path.join(__dirname, "upload/campaign_images")));


app.use("/api/auth", authRoutes);
app.use("/api/users/", userRoutes);
app.use('/api/campaigns', campaignRoutes); // Variable ka upyog karein

app.get("/", (req, res) => {
  res.send("Welcome to the backend API!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));