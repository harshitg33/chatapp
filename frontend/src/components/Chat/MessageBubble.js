/**
 * components/Chat/MessageBubble.js — Individual chat message bubble.
 * Shows message content, sender, and timestamp.
 */

import React from "react";
import { format, isToday, isYesterday } from "date-fns";
import "./MessageBubble.css";

/**
 * Formats a timestamp into a readable string.
 */
function formatTime(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return `Yesterday ${format(d, "h:mm a")}`;
  return format(d, "MMM d, h:mm a");
}

export default function MessageBubble({ message, isMine, isGrouped }) {
  return (
    <div className={`msg-row ${isMine ? "msg-row--mine" : "msg-row--theirs"} ${isGrouped ? "msg-row--grouped" : ""}`}>
      <div className={`msg-bubble ${isMine ? "msg-bubble--mine" : "msg-bubble--theirs"}`}>
        <p className="msg-content">{message.content}</p>
        <span className="msg-time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
