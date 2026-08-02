"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AiAutoMode } from "@/components/AiAutoMode";
import { ManualEditor } from "@/components/ManualEditor";
import { BatchProcessing } from "@/components/BatchProcessing";
import { AiAssistantDrawer } from "@/components/AiAssistantDrawer";

export default function HomePage() {
  const [mode, setMode] = useState<"auto" | "manual" | "batch">("manual");
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [templates, setTemplates] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [extractedSpecs, setExtractedSpecs] = useState<any>(null);

  // Fetch government exam templates on mount
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/editor/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) setTemplates(data.templates);
      })
      .catch((err) => console.error(err));
  }, []);

  const selectedTemplateObj = templates.find((t) => t.id === selectedTemplate);

  const handleApplyExtractedSpecs = (specs: any) => {
    setExtractedSpecs(specs);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Top Navigation Header */}
      <Header
        mode={mode}
        setMode={setMode}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        templates={templates}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        toggleAiAssistant={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col">
        {mode === "auto" && (
          <AiAutoMode
            onApplyExtractedSpecs={handleApplyExtractedSpecs}
            onProcessedFile={(url) => {
              setMode("manual");
            }}
          />
        )}

        {mode === "manual" && (
          <ManualEditor selectedTemplateObj={selectedTemplateObj} />
        )}

        {mode === "batch" && <BatchProcessing />}
      </main>

      {/* Slide-over AI Form Assistant */}
      <AiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
    </div>
  );
};
