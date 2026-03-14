/**
 * context/ChatContext.js — Global chat state management.
 * Manages users list, selected chat, messages, and socket events.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getSocket } from "../utils/socket";
import { useAuth } from "./AuthContext";
import API from "../utils/api";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // { userId: true/false }
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const typingTimeoutRef = useRef({});

  // ─── Fetch all users ──────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await API.get("/api/users");
      setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // ─── Fetch message history for selected user ──────────────────────────────
  const fetchMessages = useCallback(async (targetUserId) => {
    setLoadingMessages(true);
    try {
      const { data } = await API.get(`/api/messages/${targetUserId}`);
      setMessages(data.messages);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ─── Select a user to chat with ───────────────────────────────────────────
  const selectUser = useCallback((targetUser) => {
    setSelectedUser(targetUser);
    setMessages([]);
    const socket = getSocket();
    if (socket && targetUser) {
      // Join the private room
      socket.emit("room:join", { targetUserId: targetUser._id });
      fetchMessages(targetUser._id);
    }
  }, [fetchMessages]);

  // ─── Send a message ───────────────────────────────────────────────────────
  const sendMessage = useCallback((content) => {
    const socket = getSocket();
    if (!socket || !selectedUser || !content.trim()) return;
    socket.emit("message:send", {
      receiverId: selectedUser._id,
      content: content.trim(),
    });
  }, [selectedUser]);

  // ─── Typing indicators ────────────────────────────────────────────────────
  const startTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !selectedUser) return;
    socket.emit("typing:start", { targetUserId: selectedUser._id });
  }, [selectedUser]);

  const stopTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !selectedUser) return;
    socket.emit("typing:stop", { targetUserId: selectedUser._id });
  }, [selectedUser]);

  // ─── Socket event listeners ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    fetchUsers();

    // Incoming message
    const handleReceiveMessage = (message) => {
      setMessages((prev) => {
        // Avoid duplicate messages
        if (prev.find((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    // Online/offline status changes
    const handleUserStatus = ({ userId, isOnline, lastSeen }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isOnline, lastSeen } : u
        )
      );
      // Update selectedUser status too
      setSelectedUser((prev) =>
        prev?._id === userId ? { ...prev, isOnline, lastSeen } : prev
      );
    };

    // Typing start
    const handleTypingStart = ({ userId }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: true }));
      // Auto-clear typing after 3s if no stop event
      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
      }
      typingTimeoutRef.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [userId]: false }));
      }, 3000);
    };

    // Typing stop
    const handleTypingStop = ({ userId }) => {
      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
      }
      setTypingUsers((prev) => ({ ...prev, [userId]: false }));
    };

    socket.on("message:receive", handleReceiveMessage);
    socket.on("user:status", handleUserStatus);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("message:receive", handleReceiveMessage);
      socket.off("user:status", handleUserStatus);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [user, fetchUsers]);

  return (
    <ChatContext.Provider
      value={{
        users,
        selectedUser,
        messages,
        typingUsers,
        loadingMessages,
        loadingUsers,
        selectUser,
        sendMessage,
        startTyping,
        stopTyping,
        fetchUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
