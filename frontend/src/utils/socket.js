/**
 * utils/socket.js — Socket.io client singleton.
 * Creates one socket connection reused across the app.
 */

import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

let socket = null;

/**
 * Initializes (or returns existing) Socket.io connection with JWT auth.
 * @param {string} token - JWT token for authentication
 */
export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

/**
 * Returns the existing socket instance.
 */
export const getSocket = () => socket;

/**
 * Disconnects and clears the socket instance.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
