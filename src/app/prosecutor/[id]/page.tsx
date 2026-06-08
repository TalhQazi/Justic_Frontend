'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, Download, ArrowLeft, Loader2, Sparkles, Award, FileText } from 'lucide-react';
import Link from 'next/link';
import { api, ProsecutorProfile as IProsecutorProfile } from '../../../lib/api';

export default function ProsecutorPage({ params }: { params: { id: string } }) {
  const [proc, setProc] = useState<IProsecutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getProsecutor(params.id);
        if (!cancelled) setProc(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await api.recalculateProsecutor(params.id);
      const data = await api.getProsecutor(params.id);
      setProc(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleDownloadAudit = () => {
    if (!proc) return;
    const auditData = {
      reproducibility_model: 'PDI-v1.0.0',
      timestamp: new Date().toISOString(),
      entity: {
        id: proc.id,
        office_name: proc.office_name,
        pdi_aggressiveness: proc.pdi_aggressiveness,
        conviction_rate: proc.conviction_rate,
        charge_reduction_rate: proc.charge_reduction_rate,
        dismissal_rate: proc.dismissal_rate,
      },
      audit_note: 'Prosecutor aggressiveness calculated by combining charging reduction trends with conviction efficiency outcomes.'
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdi_audit_${proc.last_name.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-xs text-slate-500 font-sans">Loading Prosecutorial Profile...</span>
      </div>
    );
  }

  if (!proc) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 font-sans text-sm">Prosecutor profile not found.</p>
        <Link href="/" className="text-xs text-cyan-400 hover:underline uppercase tracking-wider mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 1.5) return 'text-red-400 text-glow-red';
    if (score < -0.5) return 'text-emerald-400 text-glow-green';
    return 'text-slate-300';
  };

  const getBorderColor = (score: number) => {
    if (score > 1.5) return 'border-glow-red';
    if (score < -0.5) return 'border-glow-emerald';
    return 'border-slate-800';
  };

  // Concentric rings config
  // Outer: Conviction, R=70, C=439.8
  const cOuter = 2 * Math.PI * 70;
  const offOuter = cOuter * (1 - proc.conviction_rate);

  // Middle: Reduction, R=50, C=314.15
  const cMiddle = 2 * Math.PI * 50;
  const offMiddle = cMiddle * (1 - proc.charge_reduction_rate);

  // Inner: Dismissal, R=30, C=188.5
  const cInner = 2 * Math.PI * 30;
  const offInner = cInner * (1 - proc.dismissal_rate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-8 py-4 min-h-[calc(100vh-100px)]"
    >
      {/* Back Link */}
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-200 uppercase tracking-widest font-sans transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Showcase */}
      <section className={`p-8 rounded-3xl glass-panel flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 ${getBorderColor(proc.pdi_aggressiveness)}`}>
        <div className="flex gap-5 items-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse-glow" />
            <Shield className="w-10 h-10 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                Prosecutorial Office
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-100 tracking-tight mt-2 leading-none">
              {proc.first_name} {proc.last_name}
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mt-1">
              {proc.office_name}
            </p>
          </div>
        </div>

        {/* Scoring Radial Box */}
        <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl min-w-[250px] w-full lg:w-auto flex flex-col gap-1 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 filter blur-[40px]" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">
            Prosecutor Deviation Index (PDI)
          </span>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className={`text-5xl font-mono font-extrabold ${getScoreColor(proc.pdi_aggressiveness)}`}>
              {proc.pdi_aggressiveness > 0 ? `+${proc.pdi_aggressiveness.toFixed(2)}` : proc.pdi_aggressiveness.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 uppercase font-mono">Aggressiveness</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans italic mt-2 leading-snug">
            Relative charging severity
          </span>
        </div>
      </section>

      {/* Grid: Nested rings & summary stats */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Concentric Progress Rings (Col span 2) */}
        <div className="lg:col-span-2 p-8 rounded-3xl glass-panel flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2 max-w-sm">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Metrics Circular Track</span>
            </div>
            <h3 className="font-display font-bold text-slate-200 text-base">Nested Rate Analytics</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Apple-style nested circular progress rings mapping key indicators. Outer Ring tracks Convictions, Middle tracks Reductions, and Inner tracks Dismissals.
            </p>
          </div>

          {/* SVG nested rings */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Outer track background and progress */}
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray={cOuter} strokeDashoffset={offOuter} strokeLinecap="round" opacity="0.85" />
              
              {/* Middle track */}
              <circle cx="80" cy="80" r="50" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
              <circle cx="80" cy="80" r="50" fill="none" stroke="#fbbf24" strokeWidth="8" strokeDasharray={cMiddle} strokeDashoffset={offMiddle} strokeLinecap="round" opacity="0.85" />
              
              {/* Inner track */}
              <circle cx="80" cy="80" r="30" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
              <circle cx="80" cy="80" r="30" fill="none" stroke="#f87171" strokeWidth="8" strokeDasharray={cInner} strokeDashoffset={offInner} strokeLinecap="round" opacity="0.85" />
            </svg>
          </div>
        </div>

        {/* Action sidebar */}
        <div className="flex flex-col gap-6 justify-between">
          <div className="p-6 rounded-3xl glass-panel">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Statistical Weight</span>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${proc.confidence_weight * 100}%` }}
                />
              </div>
              <span className="font-mono font-semibold text-xs text-emerald-400">
                {(proc.confidence_weight * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-sans">
              Weighted by case volume (N={proc.sample_size}).
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Scored Records</span>
            <div className="mt-2 text-3xl font-display font-extrabold text-slate-300">
              {proc.sample_size} cases
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">
              Public records compiled within current term.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel flex gap-3 items-center justify-between">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/20 text-slate-200 hover:text-emerald-400 font-sans text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {recalculating ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Recalculate</span>
            </button>

            <button
              onClick={handleDownloadAudit}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/20 text-slate-300 hover:text-emerald-400 transition cursor-pointer"
              title="Download Audit JSON Logs"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Sub-Rates breakdown grid cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-emerald-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Conviction Rate</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {(proc.conviction_rate * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Percentage of cases resolved with guilty verdicts or pleas.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-yellow-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-yellow-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Charge Reductions</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {(proc.charge_reduction_rate * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Percentage of cases where convicted offenses are lesser than filed charges.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-red-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-red-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Dismissal Rate</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {(proc.dismissal_rate * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Percentage of dockets dropped. Lower ratings denote higher prosecution follow-through.
          </p>
        </div>
      </section>
    </motion.div>
  );
}
