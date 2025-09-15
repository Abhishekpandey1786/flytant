// middleware/adminAuth.js
module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  // Apna secret token (kisi bhi random string jese strong password)
  const ADMIN_SECRET = "my_super_secret_admin_token";

  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({ message: "Unauthorized: Admin token missing or invalid" });
  }

  next();
};
