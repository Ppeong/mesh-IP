import React from 'react';
import { MetricSummary } from '../types';
import { ShieldCheck, ArchiveRestore } from 'lucide-react';

interface MetricCardsProps {
  metrics: MetricSummary;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const registeredCount = metrics.registeredAssets ?? (metrics as any).activeAssets ?? 0;
  const totalCount = metrics.totalAssets ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mb-3.5 sm:mb-6">
      {/* Registered Assets Metric Card */}
      <div
        id="metric-card-registered"
        className="bg-white rounded-2xl p-3.5 sm:p-5 border border-[#B2D4EB]/40 shadow-xs flex items-center justify-between gap-3 hover:border-[#C1E9D7] transition-colors"
      >
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold text-[#4A6B82] uppercase tracking-wider truncate">
            Registered Assets
          </p>
          <div className="flex items-baseline gap-2 mt-0.5 sm:mt-1">
            <span className="text-xl sm:text-3xl font-bold text-[#252525]">{registeredCount}</span>
            <span className="text-[9.5px] sm:text-xs font-semibold text-[#164E39] bg-[#C1E9D7] border border-[#A7DEC6] px-2 py-0.5 rounded-full">
              In Force
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-[#4A6B82] mt-0.5 sm:mt-1 truncate">
            Across all registered territories
          </p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C1E9D7] flex items-center justify-center text-[#164E39] border border-[#A7DEC6] shrink-0">
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* Total Assets Metric Card */}
      <div
        id="metric-card-total"
        className="bg-white rounded-2xl p-3.5 sm:p-5 border border-[#B2D4EB]/40 shadow-xs flex items-center justify-between gap-3 hover:border-[#B2D4EB] transition-colors"
      >
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold text-[#4A6B82] uppercase tracking-wider truncate">
            Total Portfolio
          </p>
          <div className="flex items-baseline gap-2 mt-0.5 sm:mt-1">
            <span className="text-xl sm:text-3xl font-bold text-[#252525]">{totalCount}</span>
            <span className="text-[9.5px] sm:text-xs font-semibold text-[#1C3A50] bg-[#B2D4EB]/60 border border-[#B2D4EB] px-2 py-0.5 rounded-full">
              Records
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-[#4A6B82] mt-0.5 sm:mt-1 truncate">
            Patents, trademarks & designs
          </p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#B2D4EB] flex items-center justify-center text-[#4A6B82] border border-[#9ec8e4] shrink-0">
          <ArchiveRestore className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
};

