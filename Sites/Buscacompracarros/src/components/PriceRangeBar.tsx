import React from 'react';
import { PriceAnalysis } from '../lib/types';
import { TrendingDown, TrendingUp, MinusCircle } from 'lucide-react';

interface PriceRangeBarProps {
  price: number;
  analysis: PriceAnalysis;
  showDetails?: boolean;
}

export default function PriceRangeBar({ price, analysis, showDetails = true }: PriceRangeBarProps) {
  const { status, statusLabel, marketAverage, difference, differencePercent, minMarketPrice, maxMarketPrice, percentileRank } = analysis;

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const formatShortK = (val: number) => `R$ ${Math.round(val / 1000)}k`;

  // Color styles based on price status
  const badgeStyles = {
    excellent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    good: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    average: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  const markerColor = {
    excellent: 'bg-emerald-500 shadow-emerald-500/50',
    good: 'bg-blue-500 shadow-blue-500/50',
    average: 'bg-amber-500 shadow-amber-500/50',
    high: 'bg-rose-500 shadow-rose-500/50',
  };

  return (
    <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
      {/* Header with price status pill & savings amount */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeStyles[status]}`}>
            {status === 'excellent' && <TrendingDown className="w-3.5 h-3.5" />}
            {status === 'good' && <TrendingDown className="w-3.5 h-3.5" />}
            {status === 'average' && <MinusCircle className="w-3.5 h-3.5" />}
            {status === 'high' && <TrendingUp className="w-3.5 h-3.5" />}
            {statusLabel}
          </span>

          {difference < 0 && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              -{formatBRL(Math.abs(difference))} ({differencePercent}%)
            </span>
          )}
          {difference > 0 && (
            <span className="text-xs font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
              +{formatBRL(difference)} (+{differencePercent}%)
            </span>
          )}
        </div>

        <div className="text-xs text-slate-400">
          Média dos anúncios: <span className="font-semibold text-slate-200">{formatBRL(marketAverage)}</span>
        </div>
      </div>

      {/* Visual spectrum bar */}
      <div className="relative pt-6 pb-2">
        {/* Track background with gradient */}
        <div className="h-3 w-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 via-amber-500 to-rose-500 opacity-80" />

        {/* Current Ad Marker */}
        <div
          className="absolute top-1.5 -translate-x-1/2 flex flex-col items-center group transition-all duration-300"
          style={{ left: `${percentileRank}%` }}
        >
          {/* Tooltip badge above marker */}
          <div className="bg-slate-950 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-lg border border-slate-700 whitespace-nowrap mb-1">
            Este anúncio: {formatBRL(price)}
          </div>
          {/* Pin circle */}
          <div className={`w-4 h-4 rounded-full border-2 border-white ${markerColor[status]} shadow-md animate-pulse`} />
        </div>
      </div>

      {/* Scale Min - Avg - Max labels */}
      <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 pt-1 border-t border-slate-800/60">
        <span>Menor: {formatShortK(minMarketPrice)}</span>
        <span className="text-slate-300 font-semibold">Média: {formatShortK(marketAverage)}</span>
        <span>Maior: {formatShortK(maxMarketPrice)}</span>
      </div>

      {showDetails && (
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
          <span>Preço do anúncio: <strong>{formatBRL(price)}</strong></span>
          <span>Diferença da média: <strong className={difference <= 0 ? 'text-emerald-400' : 'text-rose-400'}>{difference <= 0 ? '' : '+'}{formatBRL(difference)}</strong></span>
        </div>
      )}
    </div>
  );
}
