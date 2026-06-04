'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Shield, BookOpen, MapPin, Sparkles } from 'lucide-react';

interface StateMapProps {
  onSelectState: (stateCode: string) => void;
}

export default function StateMap({ onSelectState }: StateMapProps) {
  const [activeHover, setActiveHover] = useState<string | null>(null);

  const statesData: { [key: string]: { name: string; judges: string; legislators: string; prosecutors?: string; desc: string; color: string; shadow: string } } = {
    US: {
      name: 'US Federal Jurisdiction',
      judges: '2 Scored Judges',
      legislators: '2 Active Senators',
      desc: 'Supreme and Appellate federal court sentencing distributions.',
      color: 'text-cyan-400',
      shadow: 'shadow-cyan-500/20 border-cyan-500/30'
    },
    CA: {
      name: 'California (CA)',
      judges: '1 Scored Judge',
      legislators: '0 Active',
      prosecutors: '1 County DA Office',
      desc: 'California Superior Court and LA County DA metrics.',
      color: 'text-emerald-400',
      shadow: 'shadow-emerald-500/20 border-emerald-500/30'
    },
    NY: {
      name: 'New York (NY)',
      judges: '0 Scored Judges',
      legislators: '1 Active Senator',
      prosecutors: '1 Manhattan DA Office',
      desc: 'NY State Supreme Court and Manhattan Prosecutorial indices.',
      color: 'text-purple-400',
      shadow: 'shadow-purple-500/20 border-purple-500/30'
    },
    TX: {
      name: 'Texas (TX)',
      judges: '1 Scored Judge',
      legislators: '1 Active Senator',
      desc: 'Texas State District Court and roll call alignment.',
      color: 'text-red-400',
      shadow: 'shadow-red-500/20 border-red-500/30'
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-900/20 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-3">
          <Sparkles className="w-3 h-3" />
          <span>Interactive Cartogram Selector</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-display font-extrabold text-slate-100 tracking-tight leading-none">
          Explore Jurisdictional Analytics
        </h2>
        <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto mt-2 leading-relaxed">
          Hover over the glowing states or capital anchor to analyze active dockets. Click to enter the directory list.
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mt-4">
        {/* SVG Cartogram Explorer (Col span 2) */}
        <div className="lg:col-span-2 relative flex items-center justify-center p-8 rounded-3xl glass-panel">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none rounded-3xl" />
          
          <svg className="w-full max-w-[500px] h-[300px]" viewBox="0 0 500 300">
            {/* USA background mesh representation */}
            <path
              d="M 50,100 Q 150,40 250,60 T 450,80 Q 480,120 460,180 T 380,240 Q 280,260 180,250 T 50,180 Z"
              fill="rgba(255, 255, 255, 0.015)"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* California Path (West Coast) */}
            <motion.path
              d="M 65,95 L 75,98 L 85,150 L 105,190 L 98,198 L 80,195 L 60,140 Z"
              fill={activeHover === 'CA' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.05)'}
              stroke={activeHover === 'CA' ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}
              strokeWidth={activeHover === 'CA' ? '2.5' : '1.5'}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => setActiveHover('CA')}
              onMouseLeave={() => setActiveHover(null)}
              onClick={() => onSelectState('CA')}
            />

            {/* Texas Path (South Central) */}
            <motion.path
              d="M 175,185 L 235,185 L 245,210 L 225,260 L 210,260 L 195,245 L 180,230 L 165,225 Z"
              fill={activeHover === 'TX' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.05)'}
              stroke={activeHover === 'TX' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)'}
              strokeWidth={activeHover === 'TX' ? '2.5' : '1.5'}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => setActiveHover('TX')}
              onMouseLeave={() => setActiveHover(null)}
              onClick={() => onSelectState('TX')}
            />

            {/* New York Path (Northeast) */}
            <motion.path
              d="M 390,95 L 420,80 L 425,90 L 415,110 L 398,112 Z"
              fill={activeHover === 'NY' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.05)'}
              stroke={activeHover === 'NY' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}
              strokeWidth={activeHover === 'NY' ? '2.5' : '1.5'}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => setActiveHover('NY')}
              onMouseLeave={() => setActiveHover(null)}
              onClick={() => onSelectState('NY')}
            />

            {/* Central Federal Anchor Emblem */}
            <motion.g
              className="cursor-pointer"
              onMouseEnter={() => setActiveHover('US')}
              onMouseLeave={() => setActiveHover(null)}
              onClick={() => onSelectState('US')}
            >
              <circle
                cx="250"
                cy="140"
                r="22"
                fill={activeHover === 'US' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(6, 182, 212, 0.08)'}
                stroke={activeHover === 'US' ? '#06b6d4' : 'rgba(6, 182, 212, 0.4)'}
                strokeWidth="2"
              />
              {activeHover === 'US' && (
                <circle
                  cx="250"
                  cy="140"
                  r="28"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1"
                  className="animate-ring-pulse"
                />
              )}
              {/* Star inside circle */}
              <path
                d="M 250,130 L 253,137 L 260,137 L 255,142 L 257,149 L 250,145 L 243,149 L 245,142 L 240,137 L 247,137 Z"
                fill="#06b6d4"
              />
            </motion.g>

            {/* Map Text Indicators */}
            <text x="75" y="80" fill="#94a3b8" fontSize="8" fontFamily="sans-serif" textAnchor="middle" opacity="0.6">CA</text>
            <text x="210" y="175" fill="#94a3b8" fontSize="8" fontFamily="sans-serif" textAnchor="middle" opacity="0.6">TX</text>
            <text x="415" y="70" fill="#94a3b8" fontSize="8" fontFamily="sans-serif" textAnchor="middle" opacity="0.6">NY</text>
            <text x="250" y="175" fill="#06b6d4" fontSize="8" fontFamily="var(--font-display)" fontWeight="bold" textAnchor="middle" letterSpacing="1">FED</text>
          </svg>
        </div>

        {/* Info panel displaying active hover metrics */}
        <div className="h-full flex items-center">
          <div className="w-full h-64 relative rounded-3xl p-6 flex flex-col justify-between glass-panel overflow-hidden">
            <AnimatePresence mode="wait">
              {activeHover ? (
                <motion.div
                  key={activeHover}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Jurisdiction Focus</span>
                    </div>

                    <h3 className={`text-xl font-display font-extrabold tracking-tight ${statesData[activeHover].color}`}>
                      {statesData[activeHover].name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal mt-2">
                      {statesData[activeHover].desc}
                    </p>
                  </div>

                  <div className="border-t border-slate-900/60 pt-4 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Gavel className="w-3.5 h-3.5 text-slate-500" />
                      <span>{statesData[activeHover].judges}</span>
                    </div>
                    {statesData[activeHover].prosecutors && (
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                        <span>{statesData[activeHover].prosecutors}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>{statesData[activeHover].legislators}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-center text-center items-center py-6"
                >
                  <MapPin className="w-10 h-10 text-slate-700/60 animate-bounce mb-3" />
                  <h3 className="font-display font-bold text-sm text-slate-300">Hover Over Map Elements</h3>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto mt-1 leading-normal">
                    Interactive vector outlines will display active case files, judges, and legislators.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
