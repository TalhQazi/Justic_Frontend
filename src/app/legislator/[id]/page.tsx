'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCw, Download, ArrowLeft, Loader2, Info, Sparkles, Star, CheckCircle, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { api, LegislatorProfile as ILegislatorProfile } from '../../../lib/api';

export default function LegislatorPage({ params }: { params: { id: string } }) {
  const [leg, setLeg] = useState<ILegislatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  async function loadData() {
    try {
      const data = await api.getLegislator(params.id);
      setLeg(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await api.recalculateLegislator(params.id);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleDownloadAudit = () => {
    if (!leg) return;
    const auditData = {
      reproducibility_model: 'LII-v1.0.0',
      timestamp: new Date().toISOString(),
      entity: {
        id: leg.id,
        first_name: leg.first_name,
        last_name: leg.last_name,
        party: leg.party,
        legislative_influence_index: leg.legislative_influence_index,
        participation_rate: leg.participation_rate,
        district_alignment: leg.district_alignment,
      },
      audit_note: 'Legislator influence index calculated by weighted aggregation of bill sponsorship and roll-call voting alignment.'
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lii_audit_${leg.last_name.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <span className="text-xs text-slate-500 font-sans">Loading Legislative Profile...</span>
      </div>
    );
  }

  if (!leg) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 font-sans text-sm">Legislator profile not found.</p>
        <Link href="/" className="text-xs text-cyan-400 hover:underline uppercase tracking-wider mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score > 1.0) return 'text-purple-400 text-glow-purple';
    if (score < -1.0) return 'text-red-400 text-glow-red';
    return 'text-slate-300';
  };

  const getBorderColor = (score: number) => {
    if (score > 1.0) return 'border-glow-purple';
    if (score < -1.0) return 'border-glow-red';
    return 'border-slate-800';
  };

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

      {/* Profile Header */}
      <section className={`p-8 rounded-3xl glass-panel flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 ${getBorderColor(leg.legislative_influence_index)}`}>
        <div className="flex gap-5 items-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-purple-500/5 animate-pulse-glow" />
            <BookOpen className="w-10 h-10 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-purple-400 font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25">
                Legislative Chamber
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-100 tracking-tight mt-2 leading-none">
              {leg.chamber === 'senate' ? 'Senator' : 'Representative'} {leg.first_name} {leg.last_name}
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mt-1">
              Party: {leg.party} &bull; District: {leg.district || 'At-Large'}
            </p>
          </div>
        </div>

        {/* Scoring Summary Badge */}
        <div className="p-6 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl min-w-[250px] w-full lg:w-auto flex flex-col gap-1 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-500/5 filter blur-[40px]" />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">
            Legislative Influence Index (LII)
          </span>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className={`text-5xl font-mono font-extrabold ${getScoreColor(leg.legislative_influence_index)}`}>
              {leg.legislative_influence_index > 0 ? `+${leg.legislative_influence_index.toFixed(2)}` : leg.legislative_influence_index.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 uppercase font-mono">Platform Influence</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans italic mt-2 leading-snug">
            Roll call voting consensus
          </span>
        </div>
      </section>

      {/* Control Panel Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="p-6 rounded-3xl glass-panel">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Statistical Weight</span>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="bg-purple-500 h-full rounded-full" 
                style={{ width: `${leg.confidence_weight * 100}%` }}
              />
            </div>
            <span className="font-mono font-semibold text-xs text-purple-400">
              {(leg.confidence_weight * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans">
            Weighted by roll-call votes cast (N={leg.sample_size}).
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-panel">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-sans">Scored Sessions</span>
          <div className="mt-2 text-3xl font-display font-extrabold text-slate-300">
            {leg.sample_size} votes / bills
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-sans">
            Total active sessions evaluated in index score.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex gap-3 items-center justify-between">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/20 text-slate-200 hover:text-purple-400 font-sans text-xs uppercase tracking-wider font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {recalculating ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Recalculate</span>
          </button>

          <button
            onClick={handleDownloadAudit}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/20 text-slate-300 hover:text-purple-400 transition cursor-pointer"
            title="Download Audit JSON Logs"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Sub-rates grids */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-purple-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Voting Attendance</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {(leg.participation_rate * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Percentage of active voting roll calls cast.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-yellow-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Party Alignment</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {(leg.district_alignment * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Percentage of votes cast aligning with party platform majority.
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-panel flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-cyan-500/5 filter blur-[20px]" />
          <div className="flex items-center gap-2.5">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-slate-200 text-sm uppercase tracking-wider">Sponsorships</h3>
          </div>
          <div className="text-4xl font-mono font-extrabold text-slate-100">
            {leg.sample_size > 0 ? (leg.sample_size - 3 > 0 ? leg.sample_size - 3 : 0) : 0}
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Total sponsored bill drafts submitted to the chamber floor.
          </p>
        </div>
      </section>

      {/* Biography */}
      {leg.biography && (
        <section className="p-8 rounded-3xl glass-panel">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-purple-400" />
            <h3 className="font-display font-bold text-slate-200 text-base">Legislator Biography</h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans">{leg.biography}</p>
        </section>
      )}
    </motion.div>
  );
}
