'use client';

import React, { useState } from 'react';
import { mockCarAds } from '../../lib/data/mockCars';
import { analyzeCarPrice, calculateDealOpportunity } from '../../lib/engine/priceAnalyzer';
import CarCard from '../../components/CarCard';
import { Flame, ArrowUpDown, TrendingDown } from 'lucide-react';

export default function OpportunitiesPage() {
  const [sortBy, setSortBy] = useState<'fipe_discount' | 'deal_score' | 'price_asc' | 'mileage_asc' | 'year_desc'>('fipe_discount');

  const dealList = mockCarAds.map(ad => {
    const priceAnalysis = analyzeCarPrice(ad, mockCarAds);
    const deal = calculateDealOpportunity(ad, priceAnalysis);
    return { ad, priceAnalysis, deal };
  });

  const filteredDeals = dealList.filter(item => item.priceAnalysis.fipeDifference < 0 || item.deal.dealScore >= 70);

  const totalPotentialSavings = filteredDeals.reduce((acc, i) => acc + (i.priceAnalysis.fipeDifference < 0 ? Math.abs(i.priceAnalysis.fipeDifference) : 0), 0);

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'fipe_discount':
        return a.priceAnalysis.fipeDifference - b.priceAnalysis.fipeDifference;
      case 'price_asc':
        return a.ad.price - b.ad.price;
      case 'mileage_asc':
        return a.ad.mileage - b.ad.mileage;
      case 'year_desc':
        return b.ad.year - a.ad.year;
      case 'deal_score':
      default:
        return b.deal.dealScore - a.deal.dealScore;
    }
  });

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Header Showcase Banner */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-md">
              <Flame className="w-7 h-7 fill-current" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Oportunidades em Destaque</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Carros Abaixo da Tabela FIPE</h1>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right">
            <span className="text-xs text-slate-400 font-medium block">Desconto FIPE acumulado</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{formatBRL(totalPotentialSavings)}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Monitoramos os preços solicitados em comparação com a Tabela FIPE oficial para destacar veículos com oportunidade real de desconto.
        </p>
      </div>

      {/* Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
        <span className="text-slate-300 font-bold">
          {sortedDeals.length} veículos abaixo da FIPE / alta oportunidade
        </span>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Ordenar oportunidades por:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="fipe_discount">Maior Desconto vs FIPE</option>
            <option value="deal_score">Nota de Oportunidade (0-100)</option>
            <option value="price_asc">Mais Barato Primeiro</option>
            <option value="mileage_asc">Menor Quilometragem</option>
            <option value="year_desc">Mais Novo</option>
          </select>
        </div>
      </div>

      {/* Grid of Deals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedDeals.map(({ ad, priceAnalysis, deal }) => (
          <div key={ad.id} className="relative flex flex-col justify-between">
            <div className="z-10 -mb-3 mx-4 bg-slate-950 text-slate-100 p-2.5 rounded-2xl border border-emerald-500/40 shadow-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-emerald-400">
                <TrendingDown className="w-4 h-4" />
                <span>🟢 {formatBRL(Math.abs(priceAnalysis.fipeDifference))} abaixo da FIPE</span>
              </div>

              <div className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg font-black text-[11px] border border-amber-500/40">
                Score {deal.dealScore}/100
              </div>
            </div>

            <CarCard ad={ad} />
          </div>
        ))}
      </div>
    </div>
  );
}
