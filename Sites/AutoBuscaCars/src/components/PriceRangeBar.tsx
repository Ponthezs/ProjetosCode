import React from 'react';
import { PriceAnalysis } from '../lib/types';
import { TrendingDown, TrendingUp, MinusCircle, ShieldCheck } from 'lucide-react';

interface PriceRangeBarProps {
  price: number;
  analysis: PriceAnalysis;
  showDetails?: boolean;
}

export default function PriceRangeBar({ price, analysis, showDetails = true }: PriceRangeBarProps) {
  const { status, statusLabel, marketAverage, difference, differencePercent, minMarketPrice, maxMarketPrice, percentileRank, fipePrice, fipeDifference, fipeDifferencePercent } = analysis;

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const formatShortK = (val: number) => `R$ ${Math.round(val / 1000)}k`;

  return (
    <div className="space-y-4 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800">
      {/* Tabela FIPE Benchmark Header Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
          <span className="font-semibold text-slate-300">Tabela FIPE de Referência:</span>
          <strong className="text-white font-extrabold">{formatBRL(fipePrice)}</strong>
        </div>

        {fipeDifference < 0 ? (
          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            {formatBRL(Math.abs(fipeDifference))} abaixo da FIPE ({Math.abs(fipeDifferencePercent)}%)
          </span>
        ) : fipeDifference === 0 ? (
          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            No valor exato da FIPE
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {formatBRL(fipeDifference)} acima da FIPE (+{fipeDifferencePercent}%)
          </span>
        )}
      </div>

      {/* Market Average Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Status no mercado:</span>
          <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-200 border border-slate-700">
            {statusLabel}
          </span>
        </div>

        <div className="text-slate-400">
          Média dos anúncios: <strong className="text-slate-200">{formatBRL(marketAverage)}</strong>
        </div>
      </div>

      {/* Visual spectrum bar */}
      <div className="relative pt-6 pb-2">
        <div className="h-3 w-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 via-amber-500 to-rose-500 opacity-80" />

        {/* Current Ad Marker */}
        <div
          className="absolute top-1.5 -translate-x-1/2 flex flex-col items-center group transition-all duration-300"
          style={{ left: `${percentileRank}%` }}
        >
          <div className="bg-slate-950 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-lg border border-slate-700 whitespace-nowrap mb-1">
            Preço do anúncio: {formatBRL(price)}
          </div>
          <div className="w-4 h-4 rounded-full border-2 border-white bg-brand-500 shadow-md animate-pulse" />
        </div>
      </div>

      {/* Scale Min - Avg - Max labels */}
      <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 pt-1 border-t border-slate-800/60">
        <span>Menor anúncio: {formatShortK(minMarketPrice)}</span>
        <span className="text-slate-300 font-semibold">Média: {formatShortK(marketAverage)}</span>
        <span>Maior anúncio: {formatShortK(maxMarketPrice)}</span>
      </div>

      {showDetails && (
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
          <span>Preço do anúncio: <strong>{formatBRL(price)}</strong></span>
          <span>Diferença vs Média: <strong className={difference <= 0 ? 'text-emerald-400' : 'text-rose-400'}>{difference <= 0 ? '' : '+'}{formatBRL(difference)}</strong></span>
        </div>
      )}
    </div>
  );
}
