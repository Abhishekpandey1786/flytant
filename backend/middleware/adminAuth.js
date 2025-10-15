const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 
const verifyToken = (req, res, next) => {
  
    const authHeader = req.headers.authorization;
    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not set in environment variables!");
        return res.status(500).json("Server configuration error.");
    }

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1]; 

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json("Token is not valid or expired!"); 
            }
            req.user = user; 
            next();
        });
    } else {
        return res.status(401).json("You are not authenticated! (Token missing)"); 
    }
};


const verifyAdmin = (req, res, next) => {
    
    if (req.user && req.user.isAdmin) {
        next();
    } else {
       
        res.status(403).json("Forbidden: Admin access required."); 
    }
};


module.exports = { verifyToken, verifyAdmin };