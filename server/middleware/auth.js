
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required. Please log in."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        message: "Token does not contain a valid user ID. Please log in again."
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("Authentication failed: user ID not found:", decoded.id);

      return res.status(401).json({
        message: "User account not found. Please log in again."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token. Please log in again."
    });
  }
}

module.exports = authMiddleware;
