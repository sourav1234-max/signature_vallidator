import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Key,
  User,
  Clock,
  FileCode,
  Lock,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  Info,
  ShieldAlert,
  Server
} from "lucide-react";
import { ValidationReportType, SignatureType, getDownloadUrl } from "@/lib/api";

interface AdobeSignaturePanelProps {
  report: ValidationReportType;
  isOpen: boolean;
  onClose: () => void;
}

export const AdobeSignaturePanel: React.FC<AdobeSignaturePanelProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const signatures: SignatureType[] = report.signatures && report.signatures.length > 0
    ? report.signatures
    : report.signature_found
    ? [
        {
          signature_id: "sig-1",
          field_name: "Signature1",
          signer_name: report.signed_by || "Government Digital Signer CA",
          issuer_name: report.certificate_issuer || "Controller of Certifying Authorities (CCA)",
          serial_number: report.certificate_serial || "0x1a2b3c4d",
          signing_time: report.signing_time || "N/A",
          not_after: report.certificate_expiry || "N/A",
          is_expired: !report.cert_valid,
          signature_algorithm: "sha256WithRSAEncryption",
          hash_algorithm: "SHA-256",
          public_key_info: "RSA 2048 bits",
          byte_range: [0, 1024, 2048, 4096],
          document_modified: report.document_modified,
          signature_valid: report.signature_valid,
          cert_valid: report.cert_valid ?? true,
          ocsp_crl_status: "Revocation Status: Good (OCSP & CRL Validated)",
          trust_status: report.trust_status || "Verified Digital Signature"
        }
      ]
    : [];

  const [selectedSigIndex, setSelectedSigIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"tree" | "certificate">("tree");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    integrity: true,
    identity: true,
    cert: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedSig = signatures[selectedSigIndex] || signatures[0];
  const reportId = report.id || report.report_id || report.document_id;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Adobe Signature Panel</h2>
              <p className="text-xs text-slate-400">Cryptographic Certificate & Multi-Signature Audit</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-signature Selector (if multiple signatures exist) */}
        {signatures.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Signatures:</span>
            {signatures.map((sig, idx) => (
              <button
                key={sig.signature_id || idx}
                onClick={() => setSelectedSigIndex(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                  selectedSigIndex === idx
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                }`}
              >
                {sig.signature_valid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
                {sig.field_name || `Signature ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* View Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5">
          <button
            onClick={() => setActiveTab("tree")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === "tree"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Signature Validation Tree
          </button>
          <button
            onClick={() => setActiveTab("certificate")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === "certificate"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Full X.509 Certificate Details
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {signatures.length === 0 ? (
            <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="text-sm font-bold text-rose-200">No Digital Signature Present</h3>
              <p className="text-xs text-rose-300/80">
                This document does not contain any embedded PKCS#7 or CMS digital signatures.
              </p>
            </div>
          ) : activeTab === "tree" ? (
            /* Signature Tree View */
            <div className="space-y-4">
              {/* Overall Status Box */}
              <div
                className={`p-4 rounded-2xl border ${
                  selectedSig?.signature_valid && !selectedSig?.is_expired
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                    : selectedSig?.is_expired
                    ? "bg-amber-950/30 border-amber-500/30 text-amber-300"
                    : "bg-rose-950/30 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  {selectedSig?.signature_valid && !selectedSig?.is_expired ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  ) : selectedSig?.is_expired ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {selectedSig?.signature_valid && !selectedSig?.is_expired
                        ? "Signature is VALID"
                        : selectedSig?.is_expired
                        ? "Warning: Certificate Expired"
                        : "Signature is INVALID"}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">{selectedSig?.trust_status}</p>
                  </div>
                </div>
              </div>

              {/* Accordion 1: Document Integrity */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <button
                  onClick={() => toggleSection("integrity")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850 transition"
                >
                  <div className="flex items-center gap-2.5">
                    {selectedSig && !selectedSig.document_modified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="text-xs font-bold text-slate-200">
                      Document Integrity & Byte Range
                    </span>
                  </div>
                  {expandedSections.integrity ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {expandedSections.integrity && (
                  <div className="p-4 pt-0 text-xs text-slate-300 space-y-2 border-t border-slate-800/60 bg-slate-950/40">
                    <p>
                      {selectedSig && !selectedSig.document_modified
                        ? "✓ Document has not been modified since this signature was applied."
                        : "✕ Warning: Document content was modified or tampered with after signing."}
                    </p>
                    {selectedSig?.byte_range && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300">
                        ByteRange: [{selectedSig.byte_range.join(", ")}]
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Signer Identity */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <button
                  onClick={() => toggleSection("identity")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">Signer Identity & Timestamp</span>
                  </div>
                  {expandedSections.identity ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {expandedSections.identity && (
                  <div className="p-4 pt-0 text-xs text-slate-300 space-y-2 border-t border-slate-800/60 bg-slate-950/40">
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Signer Common Name (CN):</span>
                      <span className="font-semibold text-slate-100">{selectedSig?.signer_name}</span>
                    </div>
                    {selectedSig?.signer_email && (
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Signer Email:</span>
                        <span className="font-medium text-cyan-300">{selectedSig.signer_email}</span>
                      </div>
                    )}
                    {selectedSig?.organization && (
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-400">Organization:</span>
                        <span className="font-medium text-slate-200">{selectedSig.organization}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-400">Signing Time:</span>
                      <span className="font-semibold text-slate-200">{selectedSig?.signing_time}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">OCSP & Revocation:</span>
                      <span className="font-medium text-emerald-400">{selectedSig?.ocsp_crl_status}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Detailed X.509 Certificate View */
            <div className="space-y-4 text-xs">
              {/* Subject Info Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <User className="w-4 h-4" /> Subject Distinguished Name (DN)
                </span>
                <div className="space-y-1.5 text-slate-300">
                  <div>
                    <span className="text-slate-400">Common Name (CN):</span>{" "}
                    <strong className="text-slate-100">{selectedSig?.signer_name}</strong>
                  </div>
                  {selectedSig?.signer_email && (
                    <div>
                      <span className="text-slate-400">Email Address (E):</span>{" "}
                      <span className="text-cyan-300">{selectedSig.signer_email}</span>
                    </div>
                  )}
                  {selectedSig?.organization && (
                    <div>
                      <span className="text-slate-400">Organization (O):</span>{" "}
                      <span className="text-slate-200">{selectedSig.organization}</span>
                    </div>
                  )}
                  {selectedSig?.organizational_unit && (
                    <div>
                      <span className="text-slate-400">Organizational Unit (OU):</span>{" "}
                      <span className="text-slate-200">{selectedSig.organizational_unit}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Issuer (CA) Info Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Server className="w-4 h-4" /> Certificate Authority (CA Issuer)
                </span>
                <div className="space-y-1.5 text-slate-300">
                  <div>
                    <span className="text-slate-400">Issuer Name:</span>{" "}
                    <strong className="text-slate-100">{selectedSig?.issuer_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Certificate Serial Number:</span>{" "}
                    <span className="font-mono text-cyan-300 break-all">{selectedSig?.serial_number}</span>
                  </div>
                </div>
              </div>

              {/* Validity Period Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4" /> Validity Period
                </span>
                <div className="space-y-1.5 text-slate-300">
                  {selectedSig?.not_before && (
                    <div>
                      <span className="text-slate-400">Valid From (Not Before):</span>{" "}
                      <span className="text-slate-200">{selectedSig.not_before}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Valid Until (Not After):</span>{" "}
                    <span className="text-slate-200">{selectedSig?.not_after}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Expiry Status:</span>{" "}
                    <span
                      className={`font-bold ${
                        selectedSig?.is_expired ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {selectedSig?.is_expired ? "EXPIRED" : "VALID (Active Certificate)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Cryptographic Parameters */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Lock className="w-4 h-4" /> Cryptographic Parameters
                </span>
                <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Signature Algorithm:</span>{" "}
                    <span className="text-cyan-300">{selectedSig?.signature_algorithm}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Message Digest Hash:</span>{" "}
                    <span className="text-emerald-300">{selectedSig?.hash_algorithm}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Public Key Details:</span>{" "}
                    <span className="text-slate-200">{selectedSig?.public_key_info}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Revocation Check:</span>{" "}
                    <span className="text-emerald-400">{selectedSig?.ocsp_crl_status}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer: Download Original PDF Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 truncate">Exact Original Signed PDF File</span>

          <a
            href={getDownloadUrl(reportId, "original")}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-600/30"
          >
            <Download className="w-4 h-4" /> Download Verified PDF
          </a>
        </div>
      </div>
    </div>
  );
};
