"use client";

import React, { useState, useRef, useEffect } from "react";
import { Scissors, Check, X, Move, RotateCcw } from "lucide-react";

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onApplyCrop: (cropRect: { x: number; y: number; width: number; height: number }) => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onApplyCrop,
}) => {
  const [crop, setCrop] = useState({ x: 10, y: 5, width: 80, height: 85 }); // In percentages
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleApply = () => {
    if (!imgRef.current) return;
    const naturalW = imgRef.current.naturalWidth;
    const naturalH = imgRef.current.naturalHeight;

    const realX = Math.round((crop.x / 100) * naturalW);
    const realY = Math.round((crop.y / 100) * naturalH);
    const realW = Math.round((crop.width / 100) * naturalW);
    const realH = Math.round((crop.height / 100) * naturalH);

    onApplyCrop({ x: realX, y: realY, width: realW, height: realH });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full flex flex-col space-y-4 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Scissors className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Manual Passport Framing & Crop</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Adjust the passport box around your head and shoulders. Top-aligned for official passport compliance.
        </p>

        {/* Interactive Crop Viewport */}
        <div
          ref={containerRef}
          className="relative max-h-[380px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 select-none p-2"
        >
          <div className="relative inline-block">
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop Source"
              className="max-h-[360px] object-contain block pointer-events-none"
            />

            {/* Crop Overlay Mask */}
            <div
              className="absolute border-2 border-blue-400 shadow-2xl bg-blue-500/10 cursor-move rounded-md flex flex-col justify-between p-2"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
              }}
            >
              <div className="flex justify-between text-[10px] text-blue-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-blue-500/30 w-fit">
                <span>Passport Frame (3.5x4.5)</span>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-blue-400/30">
                <div className="border-r border-b border-blue-400/20"></div>
                <div className="border-r border-b border-blue-400/20"></div>
                <div className="border-b border-blue-400/20"></div>
                <div className="border-r border-b border-blue-400/20"></div>
                <div className="border-r border-b border-blue-400/20"></div>
                <div className="border-b border-blue-400/20"></div>
              </div>

              {/* Corner Drag Handles */}
              <div className="w-3 h-3 bg-blue-500 rounded-full absolute -top-1.5 -left-1.5 border border-white"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full absolute -top-1.5 -right-1.5 border border-white"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full absolute -bottom-1.5 -left-1.5 border border-white"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full absolute -bottom-1.5 -right-1.5 border border-white"></div>
            </div>
          </div>
        </div>

        {/* Quick Framing Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Framing Presets:</span>
          <button
            onClick={() => setCrop({ x: 15, y: 2, width: 70, height: 85 })}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
          >
            👤 Head & Shoulders
          </button>
          <button
            onClick={() => setCrop({ x: 20, y: 0, width: 60, height: 75 })}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
          >
            🧑 Close Face
          </button>
          <button
            onClick={() => setCrop({ x: 5, y: 0, width: 90, height: 98 })}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
          >
            🖼️ Full Frame
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Apply Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
