"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ValidationResultCard } from "@/components/ValidationResultCard";
import { getReportById, ValidationReportType } from "@/lib/api";
import { ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function StandaloneReportPage() {
  const params = useParams();
  const reportId = params?.id as string;

  const [report, setReport] = useState<ValidationReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reportId) {
      getReportById(reportId)
        .then((data) => setReport(data))
        .catch((err) => setError(err.message || "Failed to load report"))
        .finally(() => setLoading(false));
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Retrieving official digital signature report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4">
        <div className="p-6 rounded-3xl glass-panel border border-rose-500/30 text-rose-300">
          <h3 className="text-lg font-bold">Report Not Found</h3>
          <p className="text-xs text-slate-400 mt-2">{error || "The requested verification report does not exist or was deleted."}</p>
          <Link href="/" className="inline-block mt-4 px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-200">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <div className="text-center mb-6">
        <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest">Official Audit Record</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Verification Report #{reportId.slice(0, 8)}</h1>
      </div>

      <ValidationResultCard report={report} onReset={() => window.location.href = "/"} />
    </div>
  );
}
