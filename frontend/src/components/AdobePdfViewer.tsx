import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  FileText,
  RotateCw,
  Loader2,
  FileSignature
} from "lucide-react";
import { ValidationReportType, getRawDocumentUrl, getDownloadUrl } from "@/lib/api";
import { AdobeSignatureBanner } from "./AdobeSignatureBanner";
import { AdobeSignaturePanel } from "./AdobeSignaturePanel";

interface AdobePdfViewerProps {
  report: ValidationReportType;
}

export const AdobePdfViewer: React.FC<AdobePdfViewerProps> = ({ report }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(report.page_count || 1);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reportId = report.id || report.report_id || report.document_id;
  const rawUrl = getRawDocumentUrl(report.document_id);

  // Fetch PDF blob URL for rendering
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPdf(true);

    fetch(rawUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch document binary");
        return res.blob();
      })
      .then((blob) => {
        if (!isMounted) return;
        const objectUrl = URL.createObjectURL(blob);
        setPdfDataUrl(objectUrl);
        setIsLoadingPdf(false);
      })
      .catch(() => {
        if (!isMounted) return;
        // Fallback to direct raw download URL if blob fetch fails
        setPdfDataUrl(getDownloadUrl(reportId, "original"));
        setIsLoadingPdf(false);
      });

    return () => {
      isMounted = false;
    };
  }, [report.document_id, reportId, rawUrl]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage((prev) => prev + 1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden animate-fade-in flex flex-col">
      {/* 1. Adobe Acrobat Green/Amber/Red Top Signature Banner */}
      <AdobeSignatureBanner
        report={report}
        onOpenSignaturePanel={() => setIsPanelOpen(true)}
      />

      {/* 2. Adobe Reader Toolbar Header */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        {/* Page Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-slate-200">
            Page <strong className="text-cyan-400 font-bold">{currentPage}</strong> of{" "}
            <strong>{numPages}</strong>
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & Display Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono text-slate-300 px-1 font-semibold">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition ml-2"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls: Signature Panel & Download Original PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPanelOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 font-semibold flex items-center gap-1.5 transition"
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Signature Details</span>
          </button>

          <a
            href={getDownloadUrl(reportId, "verified")}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Verified PDF (2nd PDF)</span>
          </a>
        </div>
      </div>

      {/* 3. PDF Canvas / Object Rendering Area */}
      <div className="relative min-h-[550px] sm:min-h-[650px] bg-slate-900 flex items-center justify-center p-4 sm:p-6 overflow-auto">
        {isLoadingPdf ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-20 text-slate-400">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="text-xs font-semibold">Loading original signed PDF document...</p>
          </div>
        ) : pdfDataUrl ? (
          <div
            className="w-full flex justify-center transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center top",
            }}
          >
            <object
              data={`${pdfDataUrl}#page=${currentPage}`}
              type="application/pdf"
              className="w-full min-h-[600px] rounded-xl border border-slate-800 shadow-2xl bg-white"
            >
              <iframe
                src={`${pdfDataUrl}#page=${currentPage}`}
                className="w-full min-h-[600px] rounded-xl border border-slate-800 shadow-2xl bg-white"
                title="Original PDF Document"
              />
            </object>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-sm">
            Failed to render PDF preview. You can still download the exact original file using the button above.
          </div>
        )}
      </div>

      {/* 4. Adobe Acrobat Signature Details Side Panel / Drawer */}
      <AdobeSignaturePanel
        report={report}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
};
