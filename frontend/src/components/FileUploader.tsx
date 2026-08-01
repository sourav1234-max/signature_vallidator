import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, FileCheck, ShieldCheck } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  progressStep: number; // 0 to 5
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  isProcessing,
  progressStep,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_MB = 20;

  const validateAndProcessFile = (file: File) => {
    setErrorMsg(null);
    const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    if (!isPdf) {
      setErrorMsg("Invalid file format. Please upload a PDF document (.pdf).");
      setSelectedFile(null);
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      setErrorMsg(`File size (${sizeMb.toFixed(1)} MB) exceeds maximum limit of ${MAX_SIZE_MB} MB.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const steps = [
    "Uploading PDF & Computing SHA-256 Digest",
    "Parsing PDF Incremental Updates & ByteRanges",
    "Verifying PKCS#7 / CMS Cryptographic Digest",
    "Extracting X.509 Signer & CA Issuer Chain",
    "Finalizing Validation Certificate Report",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Dropzone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 transition-all cursor-pointer border-2 border-dashed glass-panel ${
          isDragOver
            ? "border-cyan-400 bg-cyan-950/30 scale-[1.01] shadow-2xl shadow-cyan-500/20"
            : selectedFile
            ? "border-emerald-500/60 bg-emerald-950/10"
            : "border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/40"
        }`}
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,application/pdf"
          className="hidden"
          disabled={isProcessing}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {isProcessing ? (
            <div className="py-6 flex flex-col items-center w-full">
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <ShieldCheck className="w-9 h-9 text-cyan-400 animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-slate-100 mb-2">Validating Digital Signature...</h3>
              <p className="text-sm text-cyan-400 font-mono mb-6">
                {selectedFile?.name} ({(selectedFile?.size ? selectedFile.size / 1024 : 0).toFixed(1)} KB)
              </p>

              {/* Progress Steps */}
              <div className="w-full max-w-md space-y-2 text-left bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                {steps.map((stepText, idx) => {
                  const stepNum = idx + 1;
                  const isDone = progressStep > stepNum;
                  const isCurrent = progressStep === stepNum;
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                      )}
                      <span className={isDone ? "text-slate-300 font-medium line-through opacity-70" : isCurrent ? "text-cyan-300 font-bold" : "text-slate-500"}>
                        {stepText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-cyan-400" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">
                Drag & Drop Digitally Signed PDF
              </h3>
              <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                Automatically verifies PKCS#7 signatures, certificate chain, timestamp, and document tampering status.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-cyan-400" /> PDF Files Only (.pdf)
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Max File Size 20 MB
                </span>
              </div>
            </>
          )}

          {errorMsg && (
            <div className="mt-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-sm flex items-center gap-3 text-left">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
