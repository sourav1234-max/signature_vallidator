"use client";

import React from "react";
import { Sparkles, Sliders, FileCheck, Moon, Sun, Bot, Layers, Download } from "lucide-react";

interface HeaderProps {
  mode: "auto" | "manual" | "batch";
  setMode: (mode: "auto" | "manual" | "batch") => void;
  selectedTemplate: string;
  setSelectedTemplate: (tpl: string) => void;
  templates: any[];
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  toggleAiAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  setMode,
  selectedTemplate,
  setSelectedTemplate,
  templates,
  isDarkMode,
  setIsDarkMode,
  toggleAiAssistant
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-300">
              DocReady AI
            </h1>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              PRO 2.0
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            Universal Document Preparation & Editor for Online Forms
          </p>
        </div>
      </div>

      {/* Center Controls: Mode Switcher & Presets */}
      <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 shadow-inner">
        <button
          onClick={() => setMode("auto")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            mode === "auto"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Auto Mode</span>
        </button>

        <button
          onClick={() => setMode("manual")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            mode === "manual"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Manual Editor</span>
        </button>

        <button
          onClick={() => setMode("batch")}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            mode === "batch"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Batch Queue</span>
        </button>
      </div>

      {/* Preset Selector & Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Template Selector */}
        <div className="relative">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer pr-8 shadow-sm"
          >
            <option value="custom">⚡ Custom Preset</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                📜 {tpl.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            ▼
          </div>
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={toggleAiAssistant}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 text-xs font-semibold transition-all"
          title="Open AI Form Assistant"
        >
          <Bot className="w-4 h-4 text-indigo-400 animate-bounce" />
          <span className="hidden md:inline">AI Help</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
        </button>
      </div>
    </header>
  );
};
