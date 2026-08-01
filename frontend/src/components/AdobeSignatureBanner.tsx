import React from "react";
import { ShieldCheck, AlertTriangle, XCircle, FileSignature, CheckCircle2, ShieldAlert, Award } from "lucide-react";
import { ValidationReportType } from "@/lib/api";

interface AdobeSignatureBannerProps {
  report: ValidationReportType;
  onOpenSignaturePanel: () => void;
}

export const AdobeSignatureBanner: React.FC<AdobeSignatureBannerProps> = ({
  report,
  onOpenSignaturePanel,
}) => {
  const isPass = report.overall_status === "VALID";
  const isWarn = report.overall_status === "WARNING";
  const isFail = report.overall_status === "INVALID";

  const signaturesCount = report.signatures?.length || (report.signature_found ? 1 : 0);
  const primarySigner = report.signed_by || "Digital Signer";

  return (
    <div
      className={`w-full rounded-t-2xl border-b transition-all duration-300 ${
        isPass
          ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-100 shadow-md shadow-emerald-950/40"
          : isWarn
          ? "bg-amber-950/80 border-amber-500/40 text-amber-100 shadow-md shadow-amber-950/40"
          : "bg-rose-950/80 border-rose-500/40 text-rose-100 shadow-md shadow-rose-950/40"
      }`}
    >
      <div className="px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Section: Adobe Reader style Status Message & Details */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
              isPass
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                : isWarn
                ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                : "bg-rose-500/20 border-rose-400/40 text-rose-300"
            }`}
          >
            {isPass ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : isWarn ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                {isPass && "Signed and all signatures are valid."}
                {isWarn && "Signed with warnings (Check certificate validity)."}
                {isFail && (report.signature_found ? "At least one signature is INVALID or document modified." : "No digital signature found in this PDF.")}
              </span>

              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                  isPass
                    ? "bg-emerald-900/60 border-emerald-500/50 text-emerald-300"
                    : isWarn
                    ? "bg-amber-900/60 border-amber-500/50 text-amber-300"
                    : "bg-rose-900/60 border-rose-500/50 text-rose-300"
                }`}
              >
                {signaturesCount > 1 ? `${signaturesCount} Signatures` : "Adobe Acrobat Standard"}
              </span>
            </div>

            <p className="text-xs opacity-90 truncate flex items-center gap-2">
              <span>Signer: <strong className="font-semibold">{primarySigner}</strong></span>
              {report.signing_time && (
                <span className="hidden md:inline text-opacity-80">• Date: {report.signing_time}</span>
              )}
              {report.certificate_issuer && (
                <span className="hidden lg:inline text-opacity-80">• Issuer: {report.certificate_issuer}</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Section: Signature Panel Button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onOpenSignaturePanel}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              isPass
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40"
                : isWarn
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40"
                : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40"
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>Signature Panel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
