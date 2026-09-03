const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("FATAL: JWT_SECRET is not configured.");
    return res.status(500).json({ error: "Server configuration error." });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Bearer token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.admin) {
      return res.status(403).json({ error: "Forbidden: Not an admin" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = { verifyAdmin };