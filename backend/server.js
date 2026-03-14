/**
 * server.js — Main entry point for the ChatApp backend.
 * Initializes Express, connects to MongoDB, sets up Socket.io,
 * and registers all API routes.
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Import route handlers
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

// Import socket handler
const initSocket = require("./config/socket");

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io Setup ────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false,
  },
   transports: ["polling", "websocket"],  // ye line add karo
  allowEIO3: true,   
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: "*",
  credentials: false,
}));
app.use(express.json()); // Parse incoming JSON bodies

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);       // Register / Login
app.use("/api/users", userRoutes);     // Get users list
app.use("/api/messages", messageRoutes); // Fetch chat history

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "ChatApp server is running" });
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/chatapp")
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ─── Initialize Socket.io Handlers ───────────────────────────────────────────
initSocket(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});