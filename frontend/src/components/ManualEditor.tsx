"use client";

import React, { useState, useEffect, useRef } from "react";
import { EditorSidebar } from "./EditorSidebar";
import { ValidationPanel } from "./ValidationPanel";
import {
  Upload,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Eye,
  Sliders,
  CheckCircle2,
  FileText
} from "lucide-react";

interface ManualEditorProps {
  selectedTemplateObj?: any;
}

export const ManualEditor: React.FC<ManualEditorProps> = ({ selectedTemplateObj }) => {
  const [activeTab, setActiveTab] = useState("dimensions");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  // Dimension states
  const [widthPx, setWidthPx] = useState(413);
  const [heightPx, setHeightPx] = useState(531);
  const [widthCm, setWidthCm] = useState(3.5);
  const [heightCm, setHeightCm] = useState(4.5);
  const [widthMm, setWidthMm] = useState(35.0);
  const [heightMm, setHeightMm] = useState(45.0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // File size states
  const [targetKb, setTargetKb] = useState(50);
  const [minKb, setMinKb] = useState(20);
  const [quality, setQuality] = useState(90);
  const [compressionLevel, setCompressionLevel] = useState("balanced");

  // Passport & Photo states
  const [bgColor, setBgColor] = useState("none");
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [sharpness, setSharpness] = useState(1.0);
  const [grayscale, setGrayscale] = useState(false);

  // Signature states
  const [signatureInk, setSignatureInk] = useState("");

  // DPI & Format
  const [dpi, setDpi] = useState(300);
  const [outputFormat, setOutputFormat] = useState("JPG");

  // Zoom & Interactive Comparison
  const [zoom, setZoom] = useState(100);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResultSizeKb, setCurrentResultSizeKb] = useState(0);

  // Apply pre-loaded government template if selected
  useEffect(() => {
    if (selectedTemplateObj && selectedTemplateObj.id !== "custom") {
      if (selectedTemplateObj.width_px) setWidthPx(selectedTemplateObj.width_px);
      if (selectedTemplateObj.height_px) setHeightPx(selectedTemplateObj.height_px);
      if (selectedTemplateObj.width_cm) setWidthCm(selectedTemplateObj.width_cm);
      if (selectedTemplateObj.height_cm) setHeightCm(selectedTemplateObj.height_cm);
      if (selectedTemplateObj.max_kb) setTargetKb(selectedTemplateObj.max_kb);
      if (selectedTemplateObj.min_kb) setMinKb(selectedTemplateObj.min_kb);
      if (selectedTemplateObj.dpi) setDpi(selectedTemplateObj.dpi);
      if (selectedTemplateObj.background) setBgColor(selectedTemplateObj.background);
      if (selectedTemplateObj.formats && selectedTemplateObj.formats.length > 0) {
        setOutputFormat(selectedTemplateObj.formats[0]);
      }
    }
  }, [selectedTemplateObj]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceFile(file);
    const url = URL.createObjectURL(file);
    setSourcePreviewUrl(url);
    setProcessedUrl(url);
    setCurrentResultSizeKb(file.size / 1024.0);
  };

  const handleApplyChanges = async () => {
    if (!sourceFile) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", sourceFile);
    formData.append("target_width", widthPx.toString());
    formData.append("target_height", heightPx.toString());
    formData.append("dpi", dpi.toString());
    if (targetKb > 0) formData.append("target_kb", targetKb.toString());
    if (minKb > 0) formData.append("min_kb", minKb.toString());
    formData.append("output_format", outputFormat);
    if (bgColor !== "none") formData.append("bg_color", bgColor);
    if (signatureInk) formData.append("signature_ink", signatureInk);
    formData.append("brightness", brightness.toString());
    formData.append("contrast", contrast.toString());
    formData.append("sharpness", sharpness.toString());
    if (grayscale) formData.append("grayscale", "true");

    try {
      const res = await fetch("http://localhost:8000/api/v1/editor/process-image", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const sizeHeader = res.headers.get("X-Processed-Size-KB");
        if (sizeHeader) setCurrentResultSizeKb(parseFloat(sizeHeader));
        
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setProcessedUrl(url);
      }
    } catch (err) {
      console.error("Failed to process edits:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (sourcePreviewUrl) {
      setProcessedUrl(sourcePreviewUrl);
      if (sourceFile) setCurrentResultSizeKb(sourceFile.size / 1024.0);
    }
    setBrightness(1.0);
    setContrast(1.0);
    setSharpness(1.0);
    setGrayscale(false);
    setBgColor("none");
    setSignatureInk("");
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 h-[calc(100vh-65px)] bg-slate-950 overflow-hidden">
      {/* Sidebar Controls */}
      <EditorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        widthPx={widthPx}
        setWidthPx={setWidthPx}
        heightPx={heightPx}
        setHeightPx={setHeightPx}
        widthCm={widthCm}
        setWidthCm={setWidthCm}
        heightCm={heightCm}
        setHeightCm={setHeightCm}
        widthMm={widthMm}
        setWidthMm={setWidthMm}
        heightMm={heightMm}
        setHeightMm={setHeightMm}
        lockAspectRatio={lockAspectRatio}
        setLockAspectRatio={setLockAspectRatio}
        targetKb={targetKb}
        setTargetKb={setTargetKb}
        minKb={minKb}
        setMinKb={setMinKb}
        quality={quality}
        setQuality={setQuality}
        compressionLevel={compressionLevel}
        setCompressionLevel={setCompressionLevel}
        bgColor={bgColor}
        setBgColor={setBgColor}
        brightness={brightness}
        setBrightness={setBrightness}
        contrast={contrast}
        setContrast={setContrast}
        sharpness={sharpness}
        setSharpness={setSharpness}
        grayscale={grayscale}
        setGrayscale={setGrayscale}
        signatureInk={signatureInk}
        setSignatureInk={setSignatureInk}
        dpi={dpi}
        setDpi={setDpi}
        outputFormat={outputFormat}
        setOutputFormat={setOutputFormat}
        onApplyChanges={handleApplyChanges}
        onReset={handleReset}
        isProcessing={isProcessing}
      />

      {/* Main Preview & Studio Canvas */}
      <main className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
        {/* Workspace Toolbar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom((z) => Math.max(25, z - 25))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-white font-semibold w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(400, z + 25))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1"></div>

            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showComparison
                  ? "bg-indigo-600 text-white border-indigo-400"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Before / After</span>
            </button>
          </div>

          {processedUrl && (
            <a
              href={processedUrl}
              download={`docready_output.${outputFormat.toLowerCase()}`}
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-green-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </a>
          )}
        </div>

        {/* Studio Viewport */}
        <div className="flex-1 min-h-[420px] bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center justify-center relative overflow-hidden p-6 shadow-inner">
          {!sourcePreviewUrl ? (
            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/60">
              <Upload className="w-12 h-12 text-blue-400 mb-3" />
              <span className="text-sm font-bold text-white mb-1">Upload Photo, Signature, or Document</span>
              <span className="text-xs text-slate-400">Drag & drop or click to browse</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          ) : (
            <div
              className="relative transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {/* Normal or Split Comparison View */}
              {showComparison && sourcePreviewUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-700 shadow-2xl max-h-[460px]">
                  {/* Before Image */}
                  <img
                    src={sourcePreviewUrl}
                    alt="Original"
                    className="max-h-[460px] object-contain"
                  />
                  {/* After Image overlay */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={processedUrl || sourcePreviewUrl}
                      alt="Processed"
                      className="max-h-[460px] object-contain max-w-none"
                    />
                  </div>
                  {/* Split Handle */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-blue-500 shadow-lg pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                      &harr;
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-700 shadow-2xl overflow-hidden bg-slate-950 p-2">
                  <img
                    src={processedUrl || sourcePreviewUrl}
                    alt="Preview"
                    className="max-h-[460px] object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Validation Panel */}
        <ValidationPanel
          currentKb={currentResultSizeKb}
          targetKb={targetKb}
          minKb={minKb}
          currentWidth={widthPx}
          targetWidth={widthPx}
          currentHeight={heightPx}
          targetHeight={heightPx}
          dpi={dpi}
          format={outputFormat}
          templateName={selectedTemplateObj?.name}
        />
      </main>
    </div>
  );
};
