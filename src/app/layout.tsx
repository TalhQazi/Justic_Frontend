import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Benchmark Justice™ — Prosecutorial & Legislative Analytics Platform',
  description:
    'Legally defensible, reproducible analytics scoring judicial sentencing deviations (BJI), prosecutorial aggressiveness (PDI), and legislative influence (LII) across federal and state courts.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
        <Header />

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
