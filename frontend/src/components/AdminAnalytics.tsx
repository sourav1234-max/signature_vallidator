import React from "react";
import { FileCheck, ShieldCheck, AlertTriangle, XCircle, Users, Activity } from "lucide-react";

interface AdminAnalyticsProps {
  analytics: {
    total_documents: number;
    total_validations: number;
    valid_count: number;
    warning_count: number;
    invalid_count: number;
    total_users: number;
    success_rate_percent: number;
  };
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Documents */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Documents</span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold text-slate-100">{analytics.total_documents}</span>
          <span className="text-xs text-slate-400 ml-2">PDF Uploads</span>
        </div>
      </div>

      {/* Valid Signatures */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valid Signatures</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold text-emerald-400">{analytics.valid_count}</span>
          <span className="text-xs text-slate-400 ml-2">({analytics.success_rate_percent}% rate)</span>
        </div>
      </div>

      {/* Invalid & Warnings */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Warnings & Invalid</span>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-rose-400">{analytics.invalid_count}</span>
          <span className="text-sm font-bold text-amber-400">+ {analytics.warning_count} Warn</span>
        </div>
      </div>

      {/* Total Users */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold text-slate-100">{analytics.total_users}</span>
          <span className="text-xs text-slate-400 ml-2">Users & Admins</span>
        </div>
      </div>
    </div>
  );
};
