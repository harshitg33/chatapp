/**
 * routes/messages.js — Message History Routes.
 * GET /api/messages/:userId — Fetch chat history between current user and :userId
 */

const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/auth");

// ─── GET /api/messages/:userId — Load chat history ───────────────────────────
router.get("/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Generate the consistent room ID for this pair of users
    const roomId = Message.getRoomId(currentUserId, userId);

    // Fetch messages, populate sender info, sort by creation time
    const messages = await Message.find({ roomId })
      .populate("sender", "username _id")
      .populate("receiver", "username _id")
      .sort({ createdAt: 1 }) // Oldest first
      .limit(100); // Cap at 100 messages for performance

    // Mark unread messages as read
    await Message.updateMany(
      { roomId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Error fetching messages." });
  }
});

module.exports = router;
