import React, { useState } from "react";
import { ValidationReportType, getDownloadUrl } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  FileText,
  FileJson,
  FileSpreadsheet,
  ShieldCheck,
  Calendar,
  Key,
  UserCheck,
  Clock,
  Layers,
  Hash,
  Sparkles,
  RefreshCw,
  FileSignature
} from "lucide-react";
import { AdobePdfViewer } from "./AdobePdfViewer";

interface ValidationResultCardProps {
  report: ValidationReportType;
  onReset: () => void;
}

export const ValidationResultCard: React.FC<ValidationResultCardProps> = ({ report, onReset }) => {
  const isPass = report.overall_status === "VALID";
  const isWarn = report.overall_status === "WARNING";
  const isFail = report.overall_status === "INVALID";

  const reportId = report.id || report.report_id || report.document_id;
  const qrUrl = typeof window !== "undefined" ? `${window.location.origin}/report/${reportId}` : `https://validator.domain/report/${reportId}`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* 1. Main Adobe Acrobat Interactive PDF Viewer with Signature Banner & Panel */}
      <AdobePdfViewer report={report} />

      {/* 2. Cryptographic Audit Summary & Downloads Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary Checklist & QR Seal */}
        <div className="lg:col-span-1 glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Verification Summary
          </h3>

          <div className="space-y-2.5">
            {report.summary_checklist && report.summary_checklist.length > 0 ? (
              report.summary_checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                    item.status === "PASS"
                      ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                      : "bg-rose-950/20 border-rose-500/20 text-rose-300"
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.status === "PASS" ? (
                    <span className="font-bold flex items-center gap-1 text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                    </span>
                  ) : (
                    <span className="font-bold flex items-center gap-1 text-rose-400 shrink-0">
                      <XCircle className="w-3.5 h-3.5" /> FAIL
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No checklist items available.</p>
            )}
          </div>

          {/* QR Code Seal Card */}
          <div className="pt-4 border-t border-slate-800 flex flex-col items-center text-center">
            <div className="bg-white p-2.5 rounded-2xl shadow-lg mb-2">
              <QRCodeSVG value={qrUrl} size={110} />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Verification ID: {reportId.slice(0, 18)}...</p>
            <span className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Official Audit QR Code
            </span>
          </div>

          <button
            onClick={onReset}
            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Validate Another PDF
          </button>
        </div>

        {/* Right Column: Key Technical Audit Attributes & Downloads */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Technical Cryptographic Audit
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Document Name */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Document Name</span>
              <span className="font-semibold text-slate-100 truncate block text-sm">{report.filename}</span>
            </div>

            {/* File Size & Pages */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">File Size & Page Count</span>
              <span className="font-semibold text-slate-100 block text-sm">
                {(report.file_size / 1024).toFixed(1)} KB • {report.page_count} Page{report.page_count > 1 ? "s" : ""}
              </span>
            </div>

            {/* Signature Present */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Digital Signature Present</span>
              <span className={`font-bold text-sm ${report.signature_found ? "text-emerald-400" : "text-rose-400"}`}>
                {report.signature_found ? "Yes (Embedded PKCS#7 / CMS)" : "No (Missing Signature)"}
              </span>
            </div>

            {/* Document Tampering */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Document Integrity</span>
              <span className={`font-bold text-sm ${!report.document_modified ? "text-emerald-400" : "text-rose-400"}`}>
                {!report.document_modified ? "Not Modified (Original Intact)" : "Modified / Tampered After Signing"}
              </span>
            </div>

            {/* Signed By */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 sm:col-span-2">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Signed By (CN)
              </span>
              <span className="font-bold text-slate-100 text-sm">{report.signed_by || "Unknown / Unsigned"}</span>
            </div>

            {/* Certificate Issuer */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 sm:col-span-2">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Key className="w-3.5 h-3.5 text-indigo-400" /> Certificate Authority (CA Issuer)
              </span>
              <span className="font-medium text-slate-200 text-sm">{report.certificate_issuer || "N/A"}</span>
            </div>

            {/* Signing Date & Time */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Signing Timestamp
              </span>
              <span className="font-semibold text-slate-200">{report.signing_time || "N/A"}</span>
            </div>

            {/* Expiry Date */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Certificate Expiry
              </span>
              <span className="font-semibold text-slate-200">{report.certificate_expiry || "N/A"}</span>
            </div>

            {/* Certificate Serial */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 sm:col-span-2 font-mono">
              <span className="text-slate-400 block mb-1">Certificate Serial Number</span>
              <span className="text-cyan-300 truncate block text-xs">{report.certificate_serial || "N/A"}</span>
            </div>

            {/* SHA-256 Hash */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 sm:col-span-2 font-mono">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Hash className="w-3.5 h-3.5 text-emerald-400" /> Document SHA-256 Fingerprint
              </span>
              <span className="text-emerald-300 break-all text-xs">{report.sha256_hash}</span>
            </div>
          </div>

          {/* Download Buttons Section */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-400">Download Options:</span>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={getDownloadUrl(reportId, "verified")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" /> Download Verified PDF (2nd PDF)
              </a>

              <a
                href={getDownloadUrl(reportId, "original")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs transition"
              >
                <FileText className="w-4 h-4 text-cyan-400" /> Original PDF (1st PDF)
              </a>

              <a
                href={getDownloadUrl(reportId, "pdf")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs transition"
              >
                <FileText className="w-4 h-4 text-amber-400" /> Audit Certificate
              </a>

              <a
                href={getDownloadUrl(reportId, "json")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs transition"
              >
                <FileJson className="w-4 h-4 text-amber-400" /> JSON
              </a>

              <a
                href={getDownloadUrl(reportId, "csv")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> CSV
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

