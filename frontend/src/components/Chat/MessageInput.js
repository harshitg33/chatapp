/**
 * components/Chat/MessageInput.js — Message text input with send button.
 * Emits typing:start / typing:stop events with debounce.
 */

import React, { useState, useRef, useCallback } from "react";
import { useChat } from "../../context/ChatContext";
import "./MessageInput.css";

export default function MessageInput() {
  const [text, setText] = useState("");
  const { sendMessage, startTyping, stopTyping } = useChat();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // ─── Handle typing events with debounce ──────────────────────────────────
  const handleChange = useCallback((e) => {
    setText(e.target.value);

    // Emit typing:start if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping();
    }

    // Reset the stop-typing timer on each keystroke
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      stopTyping();
    }, 1500);
  }, [startTyping, stopTyping]);

  // ─── Send message on submit ───────────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!text.trim()) return;

    // Clear typing state immediately on send
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    stopTyping();

    sendMessage(text);
    setText("");
  }, [text, sendMessage, stopTyping]);

  // ─── Send on Enter (Shift+Enter for newline) ──────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input-area">
      <div className="message-input-wrapper">
        <textarea
          className="message-textarea"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          maxLength={2000}
        />
        <button
          className={`send-btn ${text.trim() ? "send-btn--active" : ""}`}
          onClick={handleSend}
          disabled={!text.trim()}
          title="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
