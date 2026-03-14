/**
 * routes/users.js — User Management Routes.
 * GET /api/users — Get all users except the logged-in user
 */

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// ─── GET /api/users — Fetch all users (for the sidebar) ──────────────────────
router.get("/", protect, async (req, res) => {
  try {
    // Exclude the current user from the list
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ isOnline: -1, username: 1 }); // Online users first, then alphabetical

    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Error fetching users." });
  }
});

module.exports = router;
