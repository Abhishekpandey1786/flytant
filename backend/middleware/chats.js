const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // =========================
    // GET AUTH HEADER
    // =========================

    const authHeader =
      req.headers.authorization;

    // =========================
    // CHECK HEADER
    // =========================

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization header missing",
      });
    }

    // =========================
    // CHECK FORMAT
    // =========================

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format",
      });
    }

    // =========================
    // EXTRACT TOKEN
    // =========================

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // =========================
    // VERIFY TOKEN
    // =========================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // =========================
    // SAVE USER
    // =========================

    req.user = decoded;

    next();

  } catch (error) {
    console.error(
      "❌ Auth Middleware Error:",
      error.message
    );

    // =========================
    // TOKEN EXPIRED
    // =========================

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // =========================
    // INVALID TOKEN
    // =========================

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // =========================
    // DEFAULT ERROR
    // =========================

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = authMiddleware;