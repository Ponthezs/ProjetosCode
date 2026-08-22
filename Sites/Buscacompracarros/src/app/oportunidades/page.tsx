'use client';

import React, { useState } from 'react';
import { mockCarAds } from '../../lib/data/mockCars';
import { analyzeCarPrice, calculateDealOpportunity } from '../../lib/engine/priceAnalyzer';
import CarCard from '../../components/CarCard';
import { Flame, ArrowUpDown, TrendingDown, DollarSign } from 'lucide-react';

export default function OpportunitiesPage() {
  const [sortBy, setSortBy] = useState<'discount' | 'deal_score' | 'price_asc' | 'mileage_asc' | 'year_desc'>('deal_score');

  // Enrich ads with price analysis & deal score
  const dealList = mockCarAds.map(ad => {
    const priceAnalysis = analyzeCarPrice(ad, mockCarAds);
    const deal = calculateDealOpportunity(ad, priceAnalysis);
    return { ad, priceAnalysis, deal };
  });

  // Filter for hot opportunities or discounts
  const filteredDeals = dealList.filter(item => item.priceAnalysis.difference < 0 || item.deal.dealScore >= 70);

  // Calculate total potential savings sum
  const totalPotentialSavings = filteredDeals.reduce((acc, i) => acc + i.deal.savingsAmount, 0);

  // Sorting logic
  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'discount':
        return b.deal.savingsAmount - a.deal.savingsAmount;
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
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Flame className="w-7 h-7 fill-current" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Oportunidades em Destaque</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Carros com Preço Abaixo da Média</h1>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right">
            <span className="text-xs text-slate-400 font-medium block">Economia total disponível</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{formatBRL(totalPotentialSavings)}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Nosso algoritmo monitora em tempo real a média praticada para o mesmo ano, modelo e versão, destacando veículos que representam oportunidades reais de economia.
        </p>
      </div>

      {/* Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
        <span className="text-slate-300 font-bold">
          {sortedDeals.length} oportunidades identificadas
        </span>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Ordenar oportunidades por:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="deal_score">Índice de Oportunidade (0-100)</option>
            <option value="discount">Maior Desconto em R$</option>
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
            {/* Top Discount Callout Pill */}
            <div className="z-10 -mb-3 mx-4 bg-slate-950 text-slate-100 p-2.5 rounded-2xl border border-amber-500/40 shadow-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-emerald-400">
                <TrendingDown className="w-4 h-4" />
                <span>🟢 {formatBRL(deal.savingsAmount)} abaixo da média</span>
              </div>

              <div className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg font-black text-[11px] border border-amber-500/40">
                Oportunidade: {deal.dealScore}/100
              </div>
            </div>

            <CarCard ad={ad} />
          </div>
        ))}
      </div>
    </div>
  );
}
