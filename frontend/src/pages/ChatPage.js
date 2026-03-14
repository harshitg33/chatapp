/**
 * pages/ChatPage.js — Main chat layout.
 * Renders sidebar (user list) and chat window side by side.
 */

import React from "react";
import Sidebar from "../components/Chat/Sidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import "./ChatPage.css";

export default function ChatPage() {
  return (
    <div className="chat-page">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
