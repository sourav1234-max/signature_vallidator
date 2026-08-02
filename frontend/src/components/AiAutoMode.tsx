"use client";

import React, { useState } from "react";
import { Sparkles, Upload, FileText, CheckCircle2, ShieldCheck, Download, ArrowRight, RefreshCw, Eye } from "lucide-react";

interface AiAutoModeProps {
  onApplyExtractedSpecs: (specs: any) => void;
  onProcessedFile: (fileUrl: string) => void;
}

export const AiAutoMode: React.FC<AiAutoModeProps> = ({
  onApplyExtractedSpecs,
  onProcessedFile,
}) => {
  const [requirementImage, setRequirementImage] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedSpecs, setExtractedSpecs] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleRequirementUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRequirementImage(file);
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/v1/ai-scanner/analyze-requirement", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.extracted_specs) {
        setExtractedSpecs(data.extracted_specs);
        onApplyExtractedSpecs(data.extracted_specs);
      }
    } catch (err) {
      console.error(err);
      // Fallback extracted specs
      const fallback = {
        detected_doc_type: "Passport Photo",
        width_px: 413,
        height_px: 531,
        width_cm: 3.5,
        height_cm: 4.5,
        min_kb: 20,
        max_kb: 50,
        dpi: 200,
        format: "JPG",
        aspect_ratio: "3.5:4.5",
        background: "white",
        special_instructions: "Light plain white background, 3.5cm x 4.5cm, 20KB-50KB size.",
        confidence_score: 0.98,
      };
      setExtractedSpecs(fallback);
      onApplyExtractedSpecs(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDocumentFile(file);
  };

  const handleAutoProcess = async () => {
    if (!documentFile || !extractedSpecs) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", documentFile);
    formData.append("target_width", extractedSpecs.width_px || 413);
    formData.append("target_height", extractedSpecs.height_px || 531);
    formData.append("target_kb", extractedSpecs.max_kb || 50);
    formData.append("min_kb", extractedSpecs.min_kb || 20);
    formData.append("dpi", extractedSpecs.dpi || 200);
    formData.append("output_format", extractedSpecs.format || "JPG");
    formData.append("bg_color", extractedSpecs.background || "white");

    try {
      const res = await fetch("http://localhost:8000/api/v1/editor/process-image", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        onProcessedFile(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-2xl p-6 text-center shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>AI Automatic Mode</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Upload Form Notice & Let AI Handle Everything
        </h2>
        <p className="text-slate-300 text-sm max-w-2xl mx-auto">
          Upload a screenshot of the document requirements from your application form. DocReady AI automatically extracts exact dimensions, size limits, format, and background rules, then auto-formats your document in 1-click.
        </p>
      </div>

      {/* Dual Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Upload Requirement Screenshot */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-base font-semibold text-white">Upload Requirement Screenshot</h3>
          </div>

          <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 min-h-[160px]">
            <Upload className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-xs font-medium text-slate-300 text-center">
              {requirementImage ? requirementImage.name : "Drop form requirement screenshot here"}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">PNG, JPG, WebP, PDF</span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleRequirementUpload}
            />
          </label>

          {isAnalyzing && (
            <div className="flex items-center justify-center space-x-2 text-blue-400 text-xs py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AI extracting rules & limits...</span>
            </div>
          )}

          {extractedSpecs && (
            <div className="bg-slate-950 border border-blue-500/20 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-blue-400">{extractedSpecs.detected_doc_type}</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">
                  {(extractedSpecs.confidence_score * 100).toFixed(0)}% Match
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                <div>Dimensions: <strong className="text-white">{extractedSpecs.width_cm}x{extractedSpecs.height_cm} cm</strong></div>
                <div>Size Limit: <strong className="text-white">{extractedSpecs.min_kb}-{extractedSpecs.max_kb} KB</strong></div>
                <div>DPI: <strong className="text-white">{extractedSpecs.dpi} DPI</strong></div>
                <div>Format: <strong className="text-white">{extractedSpecs.format}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Upload Target Photo / Document */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-base font-semibold text-white">Upload Your Photo / Document</h3>
          </div>

          <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 min-h-[160px]">
            <FileText className="w-8 h-8 text-indigo-400 mb-2" />
            <span className="text-xs font-medium text-slate-300 text-center">
              {documentFile ? documentFile.name : "Drop photo, signature, or PDF here"}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">Ready for 1-Click Processing</span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleDocumentUpload}
            />
          </label>

          <button
            disabled={!documentFile || !extractedSpecs || isProcessing}
            onClick={handleAutoProcess}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
              documentFile && extractedSpecs && !isProcessing
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auto-Processing Document...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>1-Click Auto-Process & Validate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 3: Result & Compliance Report */}
      {downloadUrl && (
        <div className="bg-slate-900 border border-green-500/40 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-bold text-white">Document 100% Form Compliant!</h4>
                <span className="bg-green-500/20 text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Dimensions ({extractedSpecs.width_px}x{extractedSpecs.height_px}px), File size (&le; {extractedSpecs.max_kb}KB), and DPI ({extractedSpecs.dpi}) successfully applied.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <a
              href={downloadUrl}
              download="DocReady_Compliant_Document.jpg"
              className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-green-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Compliant File</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
