import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Gavel, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Benchmark Justice™ — Prosecutorial & Legislative Analytics Platform',
  description:
    'Legally defensible, reproducible analytics scoring judicial sentencing deviations (BJI), prosecutorial aggressiveness (PDI), and legislative influence (LII) across federal and state courts.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full text-slate-100 flex flex-col font-sans bg-transparent">
        {/* Dynamic Animated Mesh Background */}
        <div className="bg-mesh-animated" />

        {/* Premium Sticky Header */}
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#040405]/70 backdrop-blur-xl shadow-lg transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300">
                <Gavel className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg text-slate-100 tracking-tight leading-none group-hover:text-glow-cyan transition-all">
                  Benchmark <span className="text-cyan-400">Justice™</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-[0.2em] mt-0.5">Analytics Engine V2</span>
              </div>
            </Link>

            <nav className="flex items-center gap-8">
              <Link
                href="/"
                className="text-xs font-bold text-slate-400 hover:text-cyan-400 uppercase tracking-widest transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/courtlistener"
                className="text-xs font-bold text-slate-400 hover:text-cyan-400 uppercase tracking-widest transition-colors"
              >
                CourtListener
              </Link>
              <a
                href="/docs"
                target="_blank"
                className="text-xs font-bold text-slate-400 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Documentation</span>
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {children}
        </main>

        <footer className="border-t border-white/5 py-8 mt-16 bg-[#040405]/60 backdrop-blur-lg relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-slate-500 font-sans tracking-wide">
              &copy; {new Date().getFullYear()} Benchmark Justice™ Inc. Public Records Analytics.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20 max-w-lg glass-panel">
              <p className="text-[10px] text-red-300/80 leading-relaxed font-medium">
                <strong className="text-red-400">Legal Notice</strong>: Data derived from public records. Analytics do not assert subjective bias or intent. All computations are reproducible statistical distributions.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
