/**
 * components/Chat/Sidebar.js — Left panel showing users list and current user.
 */

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import Avatar from "../UI/Avatar";
import "./Sidebar.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { users, selectedUser, selectUser, loadingUsers } = useChat();
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="sidebar">
      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" className="sidebar-logo">
            <path d="M14 2C7.373 2 2 7.373 2 14c0 2.123.548 4.12 1.512 5.857L2 26l6.143-1.512A11.955 11.955 0 0014 26c6.627 0 12-5.373 12-12S20.627 2 14 2z" fill="url(#sb-grad)" />
            <defs>
              <linearGradient id="sb-grad" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6c63ff" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
          <span>ChatApp</span>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign out">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── Search ── */}
      <div className="sidebar-search">
        <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Users List ── */}
      <div className="sidebar-section-label">
        <span>Direct Messages</span>
        <span className="user-count">{filteredUsers.length}</span>
      </div>

      <div className="users-list">
        {loadingUsers ? (
          <div className="users-skeleton">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-item">
                <div className="skeleton-avatar" />
                <div className="skeleton-text">
                  <div className="skeleton-line skeleton-name" />
                  <div className="skeleton-line skeleton-status" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="no-users">
            {search ? "No users found" : "No other users yet"}
          </div>
        ) : (
          filteredUsers.map((u) => (
            <UserItem
              key={u._id}
              user={u}
              isSelected={selectedUser?._id === u._id}
              onClick={() => selectUser(u)}
            />
          ))
        )}
      </div>

      {/* ── Current User Profile ── */}
      <div className="sidebar-footer">
        <Avatar username={user?.username} size={36} online />
        <div className="footer-user-info">
          <span className="footer-username">{user?.username}</span>
          <span className="footer-status">
            <span className="status-dot online" />
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}

// ─── Single user item in the list ────────────────────────────────────────────
function UserItem({ user, isSelected, onClick }) {
  return (
    <button
      className={`user-item ${isSelected ? "user-item--active" : ""}`}
      onClick={onClick}
    >
      <div className="user-item-avatar">
        <Avatar username={user.username} size={40} online={user.isOnline} />
      </div>
      <div className="user-item-info">
        <span className="user-item-name">{user.username}</span>
        <span className={`user-item-status ${user.isOnline ? "online" : "offline"}`}>
          {user.isOnline ? "Active now" : "Offline"}
        </span>
      </div>
    </button>
  );
}
