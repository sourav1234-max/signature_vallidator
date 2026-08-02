"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Download, Award } from "lucide-react";

interface ValidationPanelProps {
  currentKb: number;
  targetKb: number;
  minKb: number;
  currentWidth: number;
  targetWidth: number;
  currentHeight: number;
  targetHeight: number;
  dpi: number;
  format: string;
  templateName?: string;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  currentKb,
  targetKb,
  minKb,
  currentWidth,
  targetWidth,
  currentHeight,
  targetHeight,
  dpi,
  format,
  templateName = "Selected Form Requirement"
}) => {
  const isSizeValid = currentKb > 0 && (targetKb === 0 || currentKb <= targetKb) && (minKb === 0 || currentKb >= minKb);
  const isWidthValid = targetWidth === 0 || Math.abs(currentWidth - targetWidth) <= 5;
  const isHeightValid = targetHeight === 0 || Math.abs(currentHeight - targetHeight) <= 5;
  const isDpiValid = dpi >= 200;
  const isFormatValid = ["JPG", "JPEG", "PNG", "PDF"].includes(format.toUpperCase());

  const passCount = [isSizeValid, isWidthValid, isHeightValid, isDpiValid, isFormatValid].filter(Boolean).length;
  const score = Math.round((passCount / 5) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-sm text-white">Live Form Validation</h3>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-extrabold text-white text-xs">{score}% Readiness</span>
        </div>
      </div>

      {/* Validation Items List */}
      <div className="space-y-2.5">
        {/* File Size */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center space-x-2">
            {isSizeValid ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-slate-200 font-medium">File Size (KB/MB)</span>
          </div>
          <span className={`font-mono font-bold ${isSizeValid ? "text-green-400" : "text-rose-400"}`}>
            {currentKb > 0 ? `${currentKb.toFixed(1)} KB` : "Waiting for output"}
          </span>
        </div>

        {/* Width & Height Dimensions */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center space-x-2">
            {isWidthValid && isHeightValid ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-slate-200 font-medium">Pixel Dimensions</span>
          </div>
          <span className={`font-mono font-bold ${isWidthValid && isHeightValid ? "text-green-400" : "text-rose-400"}`}>
            {currentWidth} &times; {currentHeight} px
          </span>
        </div>

        {/* DPI */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center space-x-2">
            {isDpiValid ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-slate-200 font-medium">Resolution (DPI)</span>
          </div>
          <span className={`font-mono font-bold ${isDpiValid ? "text-green-400" : "text-amber-400"}`}>
            {dpi} DPI
          </span>
        </div>

        {/* Format */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center space-x-2">
            {isFormatValid ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-slate-200 font-medium">File Format</span>
          </div>
          <span className={`font-mono font-bold ${isFormatValid ? "text-green-400" : "text-rose-400"}`}>
            {format.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
