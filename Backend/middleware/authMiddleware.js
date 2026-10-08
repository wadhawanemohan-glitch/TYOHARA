const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/env");


const readToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1] || null;
};


// Requires a valid login token
const verifyToken = (req, res, next) => {
  const token = readToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Login required."
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};


// Uses the login token when present, but also allows guests
const optionalAuth = (req, res, next) => {
  const token = readToken(req);

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Invalid token: continue as a guest
    }
  }

  next();
};


const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required."
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only."
    });
  }

  next();
};


module.exports = {
  verifyToken,
  optionalAuth,
  adminOnly
};
