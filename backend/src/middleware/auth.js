const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = (requiredTypes = []) => {
  return async (req, res, next) => {
    try {
      const token =
        req.cookies.token ||
        (req.headers.authorization || "").replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "dev_secret_change_me"
      );

      const user = await User.findById(payload.id);
      if (!user) {
        return res.status(401).json({ message: "Invalid token user" });
      }

      if (
        requiredTypes.length > 0 &&
        !requiredTypes.includes(user.type)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = auth;

