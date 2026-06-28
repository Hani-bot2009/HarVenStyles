/* ================================================================
   HarVenStyles — authMiddleware.js
   Attaches req.user from JWT.  Used by cart (and any future
   protected routes).  Re-use if you already have this file.
================================================================ */
const jwt  = require("jsonwebtoken");
const User = require("../models/userModel");

  const protect = async (req, res, next) => {

  console.log("AUTH HEADER RECEIVED:");
  console.log(req.headers.authorization);

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      console.log("AUTH USER:", req.user);
      console.log("TYPE:", typeof req.user.isAdmin);
      console.log("VALUE:", req.user.isAdmin);
      console.log("KEYS:", Object.keys(req.user.toObject()));

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    return res.status(401).json({ message: "Not authorised, no token" });
  }
};

module.exports = { protect };