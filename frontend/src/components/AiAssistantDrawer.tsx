"use client";

import React, { useState } from "react";
import { X, Bot, Send, Sparkles, CheckCircle2, HelpCircle } from "lucide-react";

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your DocReady AI Form Assistant. Ask me anything about online application form rules, rejection reasons, or document dimensions!"
    }
  ]);
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      let aiReply = "Based on standard online application rules, ensure your photo has a plain white background with ears visible, and file size strictly within target limits (e.g. 20KB-50KB).";
      if (userMsg.toLowerCase().includes("passport")) {
        aiReply = "Indian Passport photos strictly require 3.5cm x 4.5cm dimensions, 200-300 DPI resolution, plain white background, and JPEG file size between 20KB and 100KB.";
      } else if (userMsg.toLowerCase().includes("upsc") || userMsg.toLowerCase().includes("ssc")) {
        aiReply = "UPSC and SSC forms require signatures to be in black or blue ink on clear white paper without line rules, cropped to 4cm x 2cm under 20KB.";
      }
      setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-xs">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">DocReady AI Assistant</h3>
            <span className="text-[10px] text-green-400 font-semibold">● Online Form Guidance</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="p-2 bg-slate-950/60 border-t border-slate-800 flex space-x-1.5 overflow-x-auto">
        <button
          onClick={() => setInput("What are the rules for UPSC photos?")}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] whitespace-nowrap"
        >
          UPSC Photo Rules
        </button>
        <button
          onClick={() => setInput("How to remove signature background?")}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] whitespace-nowrap"
        >
          Signature Background
        </button>
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask AI about form requirements..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
        />
        <button
          onClick={handleSend}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
