'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { HistoricalBJIPoint, CategoryBreakdown } from '../lib/api';

interface BJIDeviationChartProps {
  historicalData: HistoricalBJIPoint[];
  categoryData: CategoryBreakdown[];
}

// Custom Tooltip for Glassmorphic styling
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      category?: string;
      count?: number;
      deviation?: number;
    };
  }>;
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121214]/95 border border-slate-800 p-3 rounded-xl shadow-xl glass-panel">
        <p className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="font-mono font-semibold text-sm text-cyan-400 mt-1">
          BJI Index: {payload[0].value > 0 ? `+${payload[0].value.toFixed(2)}` : (payload[0].value !== undefined ? payload[0].value.toFixed(2) : '')}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const deviation = data.deviation ?? 0;
    return (
      <div className="bg-[#121214]/95 border border-slate-800 p-3 rounded-xl shadow-xl glass-panel">
        <p className="font-display font-bold text-sm text-slate-200">{data.category}</p>
        <p className="font-sans text-xs text-slate-400 mt-0.5">Case Volume: {data.count} cases</p>
        <p className="font-mono font-semibold text-xs text-cyan-400 mt-1.5">
          Deviation: {deviation > 0 ? `+${deviation.toFixed(2)}` : deviation.toFixed(2)} SD
        </p>
      </div>
    );
  }
  return null;
};

export default function BJIDeviationChart({ historicalData, categoryData }: BJIDeviationChartProps) {
  // Sort historical data by year
  const sortedHistory = [...historicalData].sort((a, b) => a.year - b.year);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. Historical Line Graph */}
      <div className="p-6 rounded-2xl bg-[#111113]/90 border border-slate-800 glass-panel">
        <div className="mb-6">
          <h3 className="font-display font-bold text-slate-200 text-lg">Historical Sentencing Trend</h3>
          <p className="text-xs text-slate-400 mt-1">
            Annual average deviation from sentencing baselines (BJI) over the past years.
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="year" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={[-3, 3]} ticks={[-3, -2, -1, 0, 1, 2, 3]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
              <Line
                type="monotone"
                dataKey="average_bji"
                stroke="#06B6D4"
                strokeWidth={3}
                dot={{ fill: '#06B6D4', stroke: '#070708', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#06B6D4', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Category Deviation Bars */}
      <div className="p-6 rounded-2xl bg-[#111113]/90 border border-slate-800 glass-panel">
        <div className="mb-6">
          <h3 className="font-display font-bold text-slate-200 text-lg">Sentencing Deviation by Category</h3>
          <p className="text-xs text-slate-400 mt-1">
            Judge BJI scores mapped across specific criminal charge categories (SD: standard deviations).
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis type="number" domain={[-3, 3]} stroke="#475569" fontSize={11} tickLine={false} axisLine={false} ticks={[-3, -2, -1, 0, 1, 2, 3]} />
              <YAxis
                dataKey="category"
                type="category"
                stroke="#94A3B8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
              <Bar dataKey="deviation" radius={[0, 4, 4, 0]} maxBarSize={20} animationDuration={1500}>
                {categoryData.map((entry, index) => {
                  // Crimson for positive (harsher), Emerald for negative (lenient)
                  let color = '#94A3B8';
                  if (entry.deviation > 0.5) color = '#EF4444';
                  else if (entry.deviation < -0.5) color = '#10B981';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
