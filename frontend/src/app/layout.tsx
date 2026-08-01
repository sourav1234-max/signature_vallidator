"use client";

import React, { useState, useEffect } from "react";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toast, ToastMessage } from "@/components/Toast";
import { loginUser } from "@/lib/api";
import { Lock, Mail, KeyRound, ShieldCheck, X } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string; token: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("admin@validator.com");
  const [authPassword, setAuthPassword] = useState("Admin123!");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Sync dark class on body
    if (darkMode) {
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
    }
  }, [darkMode]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const data = await loginUser(authEmail, authPassword);
      setCurrentUser({
        email: data.user.email,
        role: data.user.role,
        token: data.access_token,
      });
      setIsAuthOpen(false);
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Authenticated Successfully",
        message: `Logged in as ${data.user.email} (${data.user.role.toUpperCase()})`,
      });
    } catch (err: any) {
      setAuthError(err.message || "Login failed");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToast({
      id: Date.now().toString(),
      type: "warning",
      title: "Logged Out",
      message: "You have been logged out.",
    });
  };

  return (
    <html lang="en" className="dark">
      <head>
        <title>Digital Signature Validator • Enterprise PDF Cryptographic Verification</title>
        <meta name="description" content="Validate digitally signed PDF documents, check X.509 certificates, verify CMS/PKCS#7 cryptographic hashes, and download official verification certificates." />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>© 2026 Digital Signature Validator. High-Precision pyHanko & X.509 Engine.</span>
            </div>
            <div className="flex gap-4">
              <a href="/docs" className="hover:text-slate-300 transition">Swagger API</a>
              <a href="/admin" className="hover:text-slate-300 transition">Admin Dashboard</a>
              <a href="/history" className="hover:text-slate-300 transition">Verification Log</a>
            </div>
          </div>
        </footer>

        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Auth Modal */}
        {isAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 shadow-2xl relative">
              <button
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Account Authentication</h3>
                <p className="text-xs text-slate-400 mt-1">Sign in with Admin or User demo credentials</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-slate-200 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-slate-200 outline-none"
                      required
                    />
                  </div>
                </div>

                {authError && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-sm text-white hover:opacity-90 transition shadow-lg shadow-cyan-500/25"
                >
                  Sign In
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400 mb-2 font-semibold">Demo Quick Login Credentials:</p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => { setAuthEmail("admin@validator.com"); setAuthPassword("Admin123!"); }}
                    className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs hover:bg-amber-500/20"
                  >
                    Admin Account
                  </button>
                  <button
                    onClick={() => { setAuthEmail("user@validator.com"); setAuthPassword("User123!"); }}
                    className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs hover:bg-cyan-500/20"
                  >
                    User Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
