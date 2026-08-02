"use client";

import React from "react";
import {
  Maximize2,
  HardDrive,
  User,
  PenTool,
  Sliders,
  FileType,
  FileCode,
  Lock,
  Unlock,
  RotateCcw,
  RotateCw,
  Sun,
  Contrast,
  Sparkles,
  Scissors
} from "lucide-react";

interface EditorSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Dimensions
  widthPx: number;
  setWidthPx: (v: number) => void;
  heightPx: number;
  setHeightPx: (v: number) => void;
  widthCm: number;
  setWidthCm: (v: number) => void;
  heightCm: number;
  setHeightCm: (v: number) => void;
  widthMm: number;
  setWidthMm: (v: number) => void;
  heightMm: number;
  setHeightMm: (v: number) => void;
  lockAspectRatio: boolean;
  setLockAspectRatio: (v: boolean) => void;
  // File Size
  targetKb: number;
  setTargetKb: (v: number) => void;
  minKb: number;
  setMinKb: (v: number) => void;
  quality: number;
  setQuality: (v: number) => void;
  compressionLevel: string;
  setCompressionLevel: (v: string) => void;
  // Passport Tools
  bgColor: string;
  setBgColor: (v: string) => void;
  brightness: number;
  setBrightness: (v: number) => void;
  contrast: number;
  setContrast: (v: number) => void;
  sharpness: number;
  setSharpness: (v: number) => void;
  grayscale: boolean;
  setGrayscale: (v: boolean) => void;
  onOpenCropModal?: () => void;
  // Signature Tools
  signatureInk: string;
  setSignatureInk: (v: string) => void;
  // DPI
  dpi: number;
  setDpi: (v: number) => void;
  // Output Format
  outputFormat: string;
  setOutputFormat: (v: string) => void;
  // Actions
  onApplyChanges: () => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  activeTab,
  setActiveTab,
  widthPx,
  setWidthPx,
  heightPx,
  setHeightPx,
  widthCm,
  setWidthCm,
  heightCm,
  setHeightCm,
  widthMm,
  setWidthMm,
  heightMm,
  setHeightMm,
  lockAspectRatio,
  setLockAspectRatio,
  targetKb,
  setTargetKb,
  minKb,
  setMinKb,
  quality,
  setQuality,
  compressionLevel,
  setCompressionLevel,
  bgColor,
  setBgColor,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  sharpness,
  setSharpness,
  grayscale,
  setGrayscale,
  onOpenCropModal,
  signatureInk,
  setSignatureInk,
  dpi,
  setDpi,
  outputFormat,
  setOutputFormat,
  onApplyChanges,
  onReset,
  isProcessing
}) => {
  const tabs = [
    { id: "dimensions", label: "Dimensions", icon: Maximize2 },
    { id: "filesize", label: "File Size", icon: HardDrive },
    { id: "passport", label: "Passport & Photo", icon: User },
    { id: "signature", label: "Signature", icon: PenTool },
    { id: "dpi", label: "DPI", icon: Sliders },
    { id: "format", label: "Format", icon: FileType },
  ];

  const handleWidthPxChange = (val: number) => {
    setWidthPx(val);
    const cm = parseFloat(((val / dpi) * 2.54).toFixed(2));
    setWidthCm(cm);
    setWidthMm(parseFloat((cm * 10).toFixed(1)));
    if (lockAspectRatio && heightPx > 0 && widthPx > 0) {
      const ratio = heightPx / widthPx;
      const newHPx = Math.round(val * ratio);
      setHeightPx(newHPx);
      const newHCm = parseFloat(((newHPx / dpi) * 2.54).toFixed(2));
      setHeightCm(newHCm);
      setHeightMm(parseFloat((newHCm * 10).toFixed(1)));
    }
  };

  const handleHeightPxChange = (val: number) => {
    setHeightPx(val);
    const cm = parseFloat(((val / dpi) * 2.54).toFixed(2));
    setHeightCm(cm);
    setHeightMm(parseFloat((cm * 10).toFixed(1)));
    if (lockAspectRatio && widthPx > 0 && heightPx > 0) {
      // Automatic width scaling based on height (Passport 3.5:4.5 ratio)
      const ratio = widthPx / heightPx;
      const newWPx = Math.round(val * ratio);
      setWidthPx(newWPx);
      const newWCm = parseFloat(((newWPx / dpi) * 2.54).toFixed(2));
      setWidthCm(newWCm);
      setWidthMm(parseFloat((newWCm * 10).toFixed(1)));
    }
  };

  const applyPassportPreset = () => {
    const h = 531;
    const w = Math.round(h * (3.5 / 4.5)); // 413 px
    setHeightPx(h);
    setWidthPx(w);
    const cmW = 3.5;
    const cmH = 4.5;
    setWidthCm(cmW);
    setHeightCm(cmH);
    setWidthMm(35.0);
    setHeightMm(45.0);
  };

  return (
    <aside className="w-full lg:w-96 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full shadow-2xl">
      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 p-2 bg-slate-950/60 overflow-x-auto scrollbar-none border-b border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6 text-xs text-slate-200">
        {/* 1. DIMENSIONS TAB */}
        {activeTab === "dimensions" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Dimension Controls</h3>
              <button
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                  lockAspectRatio
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {lockAspectRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{lockAspectRatio ? "Locked" : "Unlocked"}</span>
              </button>
            </div>

            {/* Pixels */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Pixels (px)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400">Width</span>
                  <input
                    type="number"
                    value={widthPx}
                    onChange={(e) => handleWidthPxChange(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Height</span>
                  <input
                    type="number"
                    value={heightPx}
                    onChange={(e) => handleHeightPxChange(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Centimeters */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Centimeters (cm)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400">Width</span>
                  <input
                    type="number"
                    step="0.1"
                    value={widthCm}
                    onChange={(e) => {
                      const cm = Number(e.target.value);
                      setWidthCm(cm);
                      setWidthPx(Math.round((cm / 2.54) * dpi));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Height</span>
                  <input
                    type="number"
                    step="0.1"
                    value={heightCm}
                    onChange={(e) => {
                      const cm = Number(e.target.value);
                      setHeightCm(cm);
                      setHeightPx(Math.round((cm / 2.54) * dpi));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dimension Presets */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={applyPassportPreset}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-medium text-slate-200 border border-slate-700 text-left"
                >
                  📸 Passport (3.5x4.5cm)
                </button>
                <button
                  onClick={() => {
                    handleWidthPxChange(472);
                    handleHeightPxChange(236);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-medium text-slate-200 border border-slate-700 text-left"
                >
                  ✍️ Signature (4x2cm)
                </button>
                <button
                  onClick={() => {
                    handleWidthPxChange(600);
                    handleHeightPxChange(600);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-medium text-slate-200 border border-slate-700 text-left"
                >
                  🇺🇸 US Visa (2x2 inch)
                </button>
                <button
                  onClick={() => {
                    handleWidthPxChange(350);
                    handleHeightPxChange(350);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-medium text-slate-200 border border-slate-700 text-left"
                >
                  🏛️ UPSC Photo (350x350)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. FILE SIZE TAB */}
        {activeTab === "filesize" && (
          <div className="space-y-5">
            <h3 className="font-bold text-sm text-white">File Size & Target Compression</h3>

            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Compress to Exact KB</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={targetKb}
                  onChange={(e) => setTargetKb(Number(e.target.value))}
                  placeholder="e.g. 50"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-bold">KB</span>
              </div>
              <p className="text-[11px] text-slate-400">Iterative algorithm optimizes quality to ensure file size stay strictly &le; target KB.</p>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Increase to Minimum KB</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={minKb}
                  onChange={(e) => setMinKb(Number(e.target.value))}
                  placeholder="e.g. 20"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-bold">KB</span>
              </div>
              <p className="text-[11px] text-slate-400">Pads metadata safely if original file is below form minimum size limit.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Quality Slider</span>
                <span className="text-blue-400 font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* 3. PASSPORT & PHOTO TAB */}
        {activeTab === "passport" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Passport Photo & Background Tools</h3>
              {onOpenCropModal && (
                <button
                  onClick={onOpenCropModal}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow-md shadow-blue-600/30"
                >
                  <Scissors className="w-3 h-3" />
                  <span>Manual Crop</span>
                </button>
              )}
            </div>

            {/* Background Color Replace */}
            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Background Color</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setBgColor("white")}
                  className={`p-2 rounded-lg border text-[11px] font-medium flex items-center justify-center space-x-1 ${
                    bgColor === "white" ? "bg-white text-slate-900 border-blue-500 font-bold" : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white border border-slate-400"></span>
                  <span>White</span>
                </button>
                <button
                  onClick={() => setBgColor("blue")}
                  className={`p-2 rounded-lg border text-[11px] font-medium flex items-center justify-center space-x-1 ${
                    bgColor === "blue" ? "bg-blue-600 text-white border-white font-bold" : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span>Blue</span>
                </button>
                <button
                  onClick={() => setBgColor("gray")}
                  className={`p-2 rounded-lg border text-[11px] font-medium flex items-center justify-center space-x-1 ${
                    bgColor === "gray" ? "bg-slate-400 text-slate-900 border-blue-500 font-bold" : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span>Gray</span>
                </button>
                <button
                  onClick={() => setBgColor("none")}
                  className={`p-2 rounded-lg border text-[11px] font-medium ${
                    bgColor === "none" ? "bg-blue-500/20 text-blue-300 border-blue-500" : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  Original
                </button>
              </div>

              {/* Custom Color Picker */}
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] text-slate-400">Custom Color:</span>
                <input
                  type="color"
                  value={bgColor.startsWith("#") ? bgColor : "#FFFFFF"}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-300">{bgColor}</span>
              </div>
            </div>

            {/* Brightness, Contrast, Sharpness */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Brightness</span>
                  <span className="text-blue-400 font-mono">{brightness.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Contrast</span>
                  <span className="text-blue-400 font-mono">{contrast.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={grayscale}
                  onChange={(e) => setGrayscale(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-300">Convert to Grayscale (B&W)</span>
              </label>
            </div>
          </div>
        )}

        {/* 4. SIGNATURE TAB */}
        {activeTab === "signature" && (
          <div className="space-y-5">
            <h3 className="font-bold text-sm text-white">Signature Optimization Tools</h3>
            <p className="text-slate-400 text-[11px]">
              Extract signature, clean background scan artifacts, and enforce strict ink color.
            </p>

            <div className="space-y-2">
              <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Ink Color Conversion</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSignatureInk("black")}
                  className={`p-2.5 rounded-lg border text-[11px] font-medium flex items-center justify-center space-x-1.5 ${
                    signatureInk === "black" ? "bg-slate-950 text-white border-blue-500 font-bold ring-1 ring-blue-500" : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-white"></span>
                  <span>Black Ink</span>
                </button>
                <button
                  onClick={() => setSignatureInk("blue")}
                  className={`p-2.5 rounded-lg border text-[11px] font-medium flex items-center justify-center space-x-1.5 ${
                    signatureInk === "blue" ? "bg-blue-900 text-blue-200 border-blue-500 font-bold ring-1 ring-blue-500" : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>Blue Ink</span>
                </button>
                <button
                  onClick={() => setSignatureInk("")}
                  className={`p-2.5 rounded-lg border text-[11px] font-medium ${
                    !signatureInk ? "bg-slate-700 text-white border-slate-500" : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  Keep Original
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. DPI TAB */}
        {activeTab === "dpi" && (
          <div className="space-y-5">
            <h3 className="font-bold text-sm text-white">DPI Controls</h3>
            <p className="text-slate-400 text-[11px]">Set resolution density metadata for printing and exam scanner compliance.</p>
            <div className="grid grid-cols-3 gap-2">
              {[72, 96, 150, 200, 300, 600].map((d) => (
                <button
                  key={d}
                  onClick={() => setDpi(d)}
                  className={`p-2.5 rounded-lg border text-xs font-bold ${
                    dpi === d ? "bg-blue-600 text-white border-blue-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {d} DPI
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. FORMAT TAB */}
        {activeTab === "format" && (
          <div className="space-y-5">
            <h3 className="font-bold text-sm text-white">Output Format Conversion</h3>
            <div className="grid grid-cols-2 gap-3">
              {["JPG", "PNG", "WEBP", "PDF"].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOutputFormat(fmt)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    outputFormat === fmt ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <button
          onClick={onReset}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          title="Reset All Edits"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onApplyChanges}
          disabled={isProcessing}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <span>Processing Edits...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Apply & Process</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
