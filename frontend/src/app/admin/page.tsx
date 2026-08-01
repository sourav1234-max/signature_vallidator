"use client";

import React, { useEffect, useState } from "react";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import { getAdminAnalytics, getAdminDocuments, getAdminLogs, deleteDocument, getDownloadUrl } from "@/lib/api";
import { LayoutDashboard, Search, Trash2, Download, ShieldCheck, Activity, Users, FileText, RefreshCw, KeyRound, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"documents" | "logs">("documents");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in session/memory or prompt login
    const savedToken = localStorage.getItem("validator_admin_token");
    if (savedToken) {
      setAdminToken(savedToken);
      fetchData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async (token: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [analyticsData, docsData, logsData] = await Promise.all([
        getAdminAnalytics(token),
        getAdminDocuments(token, statusFilter, search),
        getAdminLogs(token),
      ]);
      setAnalytics(analyticsData);
      setDocuments(docsData);
      setLogs(logsData);
    } catch (err: any) {
      setErrorMsg("Admin access requires administrator privileges. Please sign in with an Admin account.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      if (!res.ok) throw new Error("Invalid admin credentials");
      const data = await res.json();
      if (data.user.role !== "admin") {
        throw new Error("User account is not authorized for Admin Dashboard");
      }
      localStorage.setItem("validator_admin_token", data.access_token);
      setAdminToken(data.access_token);
      fetchData(data.access_token);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate");
    }
  };

  const handleDelete = async (docId: string, filename: string) => {
    if (!confirm(`Admin: Permanently delete document '${filename}'?`)) return;
    if (!adminToken) return;
    const ok = await deleteDocument(docId, adminToken);
    if (ok) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      fetchData(adminToken);
    }
  };

  if (!adminToken) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <KeyRound className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100">Admin Authentication Required</h2>
            <p className="text-xs text-slate-400 mt-1">Sign in with an Administrator account to access global audit logs & analytics.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Admin Email</label>
              <input
                name="email"
                type="email"
                defaultValue="admin@validator.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input
                name="password"
                type="password"
                defaultValue="Admin123!"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 outline-none"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-600 font-bold text-xs text-white shadow-lg shadow-amber-500/20 hover:opacity-90 transition"
            >
              Sign In as Administrator
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-amber-400" />
            Admin Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global Analytics, Audit Trail, and Document Governance
          </p>
        </div>

        <button
          onClick={() => fetchData(adminToken)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" /> Refresh Data
        </button>
      </div>

      {/* Analytics Counter Cards */}
      {analytics && <AdminAnalytics analytics={analytics} />}

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "documents"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            All Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "logs"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                : "bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            Audit Logs ({logs.length})
          </button>
        </div>

        {activeTab === "documents" && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search documents or signers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="VALID">VALID</option>
              <option value="WARNING">WARNING</option>
              <option value="INVALID">INVALID</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === "documents" ? (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading admin documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">No documents found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">File Name</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Signed By</th>
                    <th className="p-4">Upload Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-100 block">{doc.filename}</span>
                            <span className="text-[10px] font-mono text-slate-500">{(doc.file_size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-slate-300">{doc.owner_email}</td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          doc.overall_status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          doc.overall_status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {doc.overall_status}
                        </span>
                      </td>

                      <td className="p-4 text-slate-200">{doc.signed_by || "Unsigned / N/A"}</td>
                      <td className="p-4 font-mono text-slate-400">{new Date(doc.upload_date).toLocaleString()}</td>

                      <td className="p-4 text-right space-x-2">
                        {doc.report_id && (
                          <a
                            href={getDownloadUrl(doc.report_id, "pdf")}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs transition"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </a>
                        )}

                        <button
                          onClick={() => handleDelete(doc.id, doc.filename)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                          title="Admin Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Audit Logs Table */
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Document</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.action === 'VALIDATE' ? 'bg-cyan-500/20 text-cyan-300' :
                        log.action === 'UPLOAD' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{log.user_email}</td>
                    <td className="p-4 font-medium text-slate-200">{log.document_filename}</td>
                    <td className="p-4 font-mono text-slate-500">{log.ip_address}</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{log.details}</td>
                    <td className="p-4 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
