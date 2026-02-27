// Authentication middleware
const { getAuth } = require("../config/firebase");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Optional auth - sets user if token exists, but doesn't require it
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
  } catch (error) {
    // Silent fail for optional auth
  }
  next();
};

module.exports = { verifyToken, optionalAuth };
