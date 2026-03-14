/**
 * components/UI/Avatar.js — User avatar with initials and online indicator.
 * Generates a consistent color based on username.
 */

import React from "react";
import "./Avatar.css";

// Palette of colors for avatars
const AVATAR_COLORS = [
  "#6c63ff", "#e05b8e", "#f59e0b", "#10b981",
  "#3b82f6", "#ef4444", "#8b5cf6", "#06b6d4",
  "#f97316", "#84cc16",
];

/**
 * Picks a color deterministically from the username.
 */
function getAvatarColor(username = "") {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Gets 1–2 character initials from a username.
 */
function getInitials(username = "") {
  const parts = username.trim().split(/[\s_-]+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

export default function Avatar({ username = "", size = 40, online }) {
  const color = getAvatarColor(username);
  const initials = getInitials(username);

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: `${color}22`, // Transparent background
        border: `2px solid ${color}44`,
        fontSize: Math.max(10, size * 0.36),
      }}
      title={username}
    >
      <span style={{ color }}>{initials}</span>
      {online !== undefined && (
        <span
          className={`avatar-dot ${online ? "avatar-dot--online" : "avatar-dot--offline"}`}
          style={{
            width: Math.max(8, size * 0.28),
            height: Math.max(8, size * 0.28),
          }}
        />
      )}
    </div>
  );
}
