/**
 * models/Message.js — MongoDB schema for chat messages.
 * Supports private one-to-one conversations identified by a roomId.
 */

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // The room identifier — always sorted "userId1_userId2" (smaller ID first)
    // This ensures the same room is referenced regardless of who initiates.
    roomId: {
      type: String,
      required: true,
      index: true, // Index for faster queries
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content cannot be empty"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt = message timestamp
  }
);

// ─── Static method to generate a consistent room ID ──────────────────────────
// Sorts two user IDs alphabetically so room is the same regardless of direction
messageSchema.statics.getRoomId = function (userId1, userId2) {
  return [userId1.toString(), userId2.toString()].sort().join("_");
};

module.exports = mongoose.model("Message", messageSchema);
