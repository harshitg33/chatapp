import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io("https://chatapp-ae1a.onrender.com", {
    auth: { token },
    transports: ["polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};