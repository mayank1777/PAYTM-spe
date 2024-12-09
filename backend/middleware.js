const { JWT_SECRET } = require("./config.js");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Extract the Authorization header
    const authHeader = req.headers.authorization; // Fixed typo (`req.header` -> `req.headers`)
    
    // Check if the Authorization header exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "Authorization header missing or invalid"
        }); // 401 Unauthorized: Token missing or not in proper format
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the secret
        const decoded = jwt.verify(token, JWT_SECRET);

        // Ensure the token contains a userId
        if (!decoded.userId) {
            return res.status(403).json({
                message: "Invalid token: userId not found"
            }); // 403 Forbidden: Token invalid but present
        }

        // Attach the userId to the request object for downstream use
        req.userId = decoded.userId;

        // Pass control to the next middleware or route handler
        next();
    } catch (err) {
        // Handle errors during token verification (e.g., expired or tampered token)
        return res.status(403).json({
            message: "Invalid or expired token"
        }); // 403 Forbidden: Token invalid or expired
    }
};

module.exports = {
    authMiddleware
};
