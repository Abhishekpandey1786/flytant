// middleware/roleMiddleware.js
module.exports = function (requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    
    if (req.user.userType !== requiredRole) {
      return res.status(403).json({ msg: "Access denied. Only " + requiredRole + " can perform this action." });
    }

    next();
  };
};
