/**
 * components/Chat/ChatWindow.js — Main chat area with messages and input.
 */

import React, { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import Avatar from "../UI/Avatar";
import "./ChatWindow.css";

export default function ChatWindow() {
  const { user } = useAuth();
  const { selectedUser, messages, typingUsers, loadingMessages } = useChat();
  const messagesEndRef = useRef(null);

  // ─── Auto-scroll to latest message ───────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // ─── Empty state when no user selected ───────────────────────────────────
  if (!selectedUser) {
    return (
      <div className="chat-window chat-window--empty">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
              <path d="M14 2C7.373 2 2 7.373 2 14c0 2.123.548 4.12 1.512 5.857L2 26l6.143-1.512A11.955 11.955 0 0014 26c6.627 0 12-5.373 12-12S20.627 2 14 2z" fill="url(#empty-grad)" opacity="0.4"/>
              <defs>
                <linearGradient id="empty-grad" x1="2" y1="2" x2="26" y2="26">
                  <stop stopColor="#6c63ff"/>
                  <stop offset="1" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2>Select a conversation</h2>
          <p>Choose a user from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  const isTyping = typingUsers[selectedUser._id];

  return (
    <div className="chat-window">
      {/* ── Chat Header ── */}
      <div className="chat-header">
        <div className="chat-header-user">
          <Avatar username={selectedUser.username} size={38} online={selectedUser.isOnline} />
          <div className="chat-header-info">
            <span className="chat-header-name">{selectedUser.username}</span>
            <span className={`chat-header-status ${selectedUser.isOnline ? "online" : "offline"}`}>
              {isTyping ? (
                <span className="typing-status">typing...</span>
              ) : selectedUser.isOnline ? (
                "Active now"
              ) : (
                "Offline"
              )}
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          <button className="header-action-btn" title="User info">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div className="messages-area">
        {loadingMessages ? (
          <div className="messages-loading">
            {[1,2,3].map(i => (
              <div key={i} className={`msg-skeleton ${i % 2 === 0 ? "msg-skeleton--right" : ""}`}>
                <div className="msg-skeleton-bubble" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="messages-empty">
            <div className="messages-empty-avatar">
              <Avatar username={selectedUser.username} size={56} />
            </div>
            <p className="messages-empty-name">{selectedUser.username}</p>
            <p className="messages-empty-hint">Say hello to start the conversation! 👋</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isMine = msg.sender._id === user._id || msg.sender === user._id;
              const prevMsg = messages[idx - 1];
              // Group consecutive messages from same sender
              const isGrouped = prevMsg &&
                (prevMsg.sender._id || prevMsg.sender) === (msg.sender._id || msg.sender);

              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isMine={isMine}
                  isGrouped={isGrouped}
                />
              );
            })}

            {/* ── Typing Indicator ── */}
            {isTyping && (
              <div className="typing-indicator">
                <Avatar username={selectedUser.username} size={24} />
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Message Input ── */}
      <MessageInput />
    </div>
  );
}
