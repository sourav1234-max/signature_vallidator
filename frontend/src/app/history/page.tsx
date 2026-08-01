"use client";

import React, { useEffect, useState } from "react";
import { getHistory, deleteDocument, HistoryItem, getDownloadUrl } from "@/lib/api";
import { History, Search, FileText, Download, Trash2, CheckCircle2, AlertTriangle, XCircle, ExternalLink, Calendar, Hash } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, []);

  const handleDelete = async (docId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete '${filename}'?`)) return;
    const ok = await deleteDocument(docId);
    if (ok) {
      setItems((prev) => prev.filter((i) => i.document_id !== docId));
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterStatus !== "ALL" && item.overall_status !== filterStatus) {
      return false;
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchFile = item.filename.toLowerCase().includes(s);
      const matchSigner = item.signed_by && item.signed_by.toLowerCase().includes(s);
      const matchHash = item.sha256_hash.toLowerCase().includes(s);
      return matchFile || matchSigner || matchHash;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <History className="w-8 h-8 text-cyan-400" />
            Verification History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Log of previously uploaded and evaluated PDF documents
          </p>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search filename, signer, hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs text-slate-200 outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="VALID">VALID</option>
            <option value="WARNING">WARNING</option>
            <option value="INVALID">INVALID</option>
          </select>
        </div>
      </div>

      {/* History Data Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading validation history...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No document validation records found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Document</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Signed By</th>
                  <th className="p-4">Upload Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map((item) => {
                  const isPass = item.overall_status === "VALID";
                  const isWarn = item.overall_status === "WARNING";
                  const badgeBg = isPass
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : isWarn
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30";

                  const StatusIcon = isPass ? CheckCircle2 : isWarn ? AlertTriangle : XCircle;

                  return (
                    <tr key={item.document_id} className="hover:bg-slate-900/40 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-100 block">{item.filename}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {(item.file_size / 1024).toFixed(1)} KB • {item.sha256_hash.slice(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${badgeBg}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {item.overall_status}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-200">{item.signed_by || "Unsigned / Unknown"}</span>
                        <span className="block text-[10px] text-slate-400">{item.trust_status || "N/A"}</span>
                      </td>

                      <td className="p-4 text-slate-400 font-mono">
                        {new Date(item.upload_date).toLocaleDateString()} {new Date(item.upload_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {item.report_id && (
                          <a
                            href={getDownloadUrl(item.report_id, "pdf")}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition"
                            title="Download PDF Certificate"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </a>
                        )}

                        <button
                          onClick={() => handleDelete(item.document_id, item.filename)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
