import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, History, LayoutDashboard, FileCode, Sun, Moon, User, Lock, KeyRound } from "lucide-react";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentUser: { email: string; role: string; token: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: "Validator", href: "/", icon: ShieldCheck },
    { label: "History", href: "/history", icon: History },
    { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Digital Signature
            </span>
            <span className="text-cyan-400 font-semibold text-lg ml-1">Validator</span>
            <span className="block text-[10px] text-slate-400 tracking-wider font-mono uppercase">
              PKCS#7 / pyHanko Verified
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            API Docs
          </a>
        </nav>

        {/* Controls: Theme & Auth */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Toggle Dark / Light mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>

          {/* User Auth Info */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 max-w-[120px] truncate">{currentUser.email}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                  currentUser.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 hover:bg-rose-500/10 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-400 text-sm font-medium transition shadow-sm"
            >
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Login / Access
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
