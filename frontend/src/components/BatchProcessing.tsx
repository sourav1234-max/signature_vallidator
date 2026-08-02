"use client";

import React, { useState } from "react";
import { Layers, Upload, Download, Trash2, CheckCircle, RefreshCw, FileArchive } from "lucide-react";

export const BatchProcessing: React.FC = () => {
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setBatchFiles((prev) => [...prev, ...filesArr]);
      setCompleted(false);
    }
  };

  const removeFile = (idx: number) => {
    setBatchFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProcessBatch = async () => {
    if (batchFiles.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCompleted(true);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-xs text-slate-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Batch Document Processing & ZIP Export</h2>
          </div>
          <span className="text-slate-400">{batchFiles.length} File(s) Queued</span>
        </div>

        {/* Dropzone */}
        <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50">
          <Upload className="w-10 h-10 text-blue-400 mb-2" />
          <span className="text-sm font-semibold text-white">Upload Multiple Photos / PDFs</span>
          <span className="text-slate-400 text-[11px] mt-1">Batch resize, compress & convert in 1-click</span>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleBatchUpload}
          />
        </label>

        {/* File Queue List */}
        {batchFiles.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {batchFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-mono text-white truncate max-w-xs">{file.name}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => removeFile(idx)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            disabled={batchFiles.length === 0 || isProcessing}
            onClick={handleProcessBatch}
            className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              batchFiles.length > 0 && !isProcessing
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Batch Queue...</span>
              </>
            ) : completed ? (
              <>
                <FileArchive className="w-4 h-4 text-green-300" />
                <span>Download All (ZIP)</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Process All Files</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
