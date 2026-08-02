import React from "react";
import "./globals.css";

export const metadata = {
  title: "DocReady AI • Professional Document Preparation & Editor for Online Forms",
  description: "Resize, compress, convert, edit, clean, and validate photos, signatures, PDFs, and scanned documents for government application forms."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
