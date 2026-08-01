"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { ValidationResultCard } from "@/components/ValidationResultCard";
import { uploadAndValidatePdf, ValidationReportType } from "@/lib/api";
import { ShieldCheck, FileSearch, Lock, Award, CheckCircle2, Zap, ArrowRight, FileText } from "lucide-react";

export default function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [validationReport, setValidationReport] = useState<ValidationReportType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setProgressStep(1);
    setErrorMessage(null);
    setValidationReport(null);

    // Simulate progress animation steps
    const stepInterval = setInterval(() => {
      setProgressStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    try {
      const report = await uploadAndValidatePdf(file);
      clearInterval(stepInterval);
      setProgressStep(5);
      setTimeout(() => {
        setValidationReport(report);
        setIsProcessing(false);
      }, 500);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setProgressStep(0);
      setErrorMessage(err.message || "Failed to validate digital signature");
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      {!validationReport && (
        <section className="text-center max-w-4xl mx-auto space-y-4 pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" /> High-Security PDF Verification Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Digital Signature <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
              Validator & Audit Engine
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Verify government-issued digitally signed PDF documents, check X.509 certificate validity, detect post-signing modifications, and download official verification certificates.
          </p>
        </section>
      )}

      {/* Main Action Area: File Uploader or Validation Result */}
      {validationReport ? (
        <ValidationResultCard
          report={validationReport}
          onReset={() => {
            setValidationReport(null);
            setProgressStep(0);
          }}
        />
      ) : (
        <div className="space-y-6">
          <FileUploader
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            progressStep={progressStep}
          />

          {errorMessage && (
            <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-sm text-center">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {/* Feature Highlights Grid */}
      {!validationReport && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-6xl mx-auto">
          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Cryptographic Integrity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validates CMS / PKCS#7 byte ranges to detect if even a single character was modified or appended after the PDF signature was placed.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">X.509 Certificate Chain</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Parses signer CN, Organization, Certificate Authority (CA) issuer, serial number, validity dates, and expiration alerts.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Verification Certificate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates official downloadable PDF certificates with verification IDs, document SHA-256 fingerprints, and scannable QR codes.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
