const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization header missing",
      });
    }
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format",
      });
    }
    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    req.user = decoded;

    next();

  } catch (error) {
    console.error(
      "❌ Auth Middleware Error:",
      error.message
    );
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = authMiddleware;