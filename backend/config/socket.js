/**
 * config/socket.js — Socket.io Event Handler.
 * Manages real-time events:
 *   - user:connect / user:disconnect (online status)
 *   - message:send / message:receive (private messaging)
 *   - typing:start / typing:stop (typing indicators)
 *   - room:join (joining private chat rooms)
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");

const initSocket = (io) => {
  // ─── Socket Authentication Middleware ──────────────────────────────────────
  // Verify JWT before allowing a socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error: No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("Authentication error: User not found"));

      socket.user = user; // Attach user to socket instance
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // ─── Connection Handler ────────────────────────────────────────────────────
  io.on("connection", async (socket) => {
    console.log(`🟢 User connected: ${socket.user.username} (${socket.id})`);

    // Update user status to online and save socket ID
    await User.findByIdAndUpdate(socket.user._id, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date(),
    });

    // Broadcast to all other users that this user is online
    socket.broadcast.emit("user:status", {
      userId: socket.user._id,
      isOnline: true,
    });

    // ── Join Private Room ────────────────────────────────────────────────────
    // Client joins a room when they open a chat with another user
    socket.on("room:join", ({ targetUserId }) => {
      const roomId = Message.getRoomId(socket.user._id, targetUserId);
      socket.join(roomId);
      console.log(`📦 ${socket.user.username} joined room: ${roomId}`);
    });

    // ── Send Message ─────────────────────────────────────────────────────────
    socket.on("message:send", async ({ receiverId, content }) => {
      try {
        if (!content || !content.trim()) return;

        const roomId = Message.getRoomId(socket.user._id, receiverId);

        // Persist the message to MongoDB
        const newMessage = await Message.create({
          roomId,
          sender: socket.user._id,
          receiver: receiverId,
          content: content.trim(),
        });

        // Populate sender info for the response
        const populatedMessage = await Message.findById(newMessage._id)
          .populate("sender", "username _id")
          .populate("receiver", "username _id");

        // Emit the message to everyone in the room (sender + receiver)
        io.to(roomId).emit("message:receive", populatedMessage);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", { message: "Failed to send message." });
      }
    });

    // ── Typing Indicators ────────────────────────────────────────────────────
    socket.on("typing:start", ({ targetUserId }) => {
      const roomId = Message.getRoomId(socket.user._id, targetUserId);
      // Notify the other user in the room (not the sender themselves)
      socket.to(roomId).emit("typing:start", {
        userId: socket.user._id,
        username: socket.user.username,
      });
    });

    socket.on("typing:stop", ({ targetUserId }) => {
      const roomId = Message.getRoomId(socket.user._id, targetUserId);
      socket.to(roomId).emit("typing:stop", {
        userId: socket.user._id,
      });
    });

    // ── Disconnect Handler ───────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`🔴 User disconnected: ${socket.user.username}`);

      // Update user to offline
      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        socketId: null,
        lastSeen: new Date(),
      });

      // Broadcast offline status to all users
      socket.broadcast.emit("user:status", {
        userId: socket.user._id,
        isOnline: false,
        lastSeen: new Date(),
      });
    });
  });
};

module.exports = initSocket;
