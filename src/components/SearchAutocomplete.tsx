'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Gavel, Shield, BookOpen, Loader2 } from 'lucide-react';
import { api, SearchItem } from '../lib/api';

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/${item.type}/${item.id}`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'judge': return <Gavel className="w-4 h-4 text-cyan-400" />;
      case 'prosecutor': return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'legislator': return <BookOpen className="w-4 h-4 text-indigo-400" />;
      default: return null;
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score > 0.5) return 'text-red-400 text-glow-red';
    if (score < -0.5) return 'text-emerald-400 text-glow-green';
    return 'text-slate-400';
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search judges, prosecutors..."
          className="w-full bg-black/60 text-slate-100 placeholder-slate-500 pl-12 pr-10 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 font-sans glass-panel group-hover:border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          ) : (
            <div className="hidden sm:flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-slate-400">Ctrl</kbd>
              <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-slate-400">K</kbd>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, type: 'spring', bounce: 0.2 }}
            className="absolute z-50 w-full mt-3 bg-[#0a0a0c]/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            <div className="max-h-80 overflow-y-auto py-2">
              {results.map((item, index) => (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 group-hover:scale-110 transition-transform">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <div className="font-sans font-medium text-slate-200 group-hover:text-white transition-colors">
                        {item.display_name}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold">{item.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-slate-500">{item.state}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm font-bold ${getScoreColorClass(item.current_score)}`}>
                      {item.current_score > 0 ? `+${item.current_score.toFixed(2)}` : item.current_score.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
                      Index Score
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
