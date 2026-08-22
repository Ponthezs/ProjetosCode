'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CarCard from '../components/CarCard';
import { mockCarAds } from '../lib/data/mockCars';
import { analyzeCarPrice, calculateDealOpportunity } from '../lib/engine/priceAnalyzer';
import { Search, Flame, ArrowRight, ShieldCheck, Zap, TrendingDown } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedMaxPrice, setSelectedMaxPrice] = useState('');
  const [selectedMinYear, setSelectedMinYear] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');

  const searchExamples = [
    'Toyota Corolla XEi 2022',
    'Honda Civic Touring até R$ 130.000',
    'SUV automático até R$ 100.000',
    'Volkswagen T-Cross 2023',
    'Chevrolet Onix 2024',
    'Jeep Compass Longitude 2022',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedBrand) params.set('brand', selectedBrand);
    if (selectedMaxPrice) params.set('maxPrice', selectedMaxPrice);
    if (selectedMinYear) params.set('minYear', selectedMinYear);
    if (selectedTransmission) params.set('transmission', selectedTransmission);

    router.push(`/busca?${params.toString()}`);
  };

  const hotDeals = mockCarAds
    .map(ad => {
      const priceAnalysis = analyzeCarPrice(ad, mockCarAds);
      const deal = calculateDealOpportunity(ad, priceAnalysis);
      return { ad, deal };
    })
    .sort((a, b) => b.deal.dealScore - a.deal.dealScore)
    .slice(0, 3)
    .map(item => item.ad);

  return (
    <div className="space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <span>Comparativo com Tabela FIPE & Acesso Direto aos Anúncios</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Encontre seu <span className="text-brand-400">próximo carro</span> pelo melhor preço do mercado
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Pesquise em marketplaces automotivos em um só lugar, compare com a Tabela FIPE e acesse o link original do vendedor em 1 clique.
        </p>

        {/* Centralized Search Box */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="🔎 Digite marca, modelo, versão ou características..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-base sm:text-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
            />
            <Search className="absolute left-4 top-4.5 w-5 h-5 text-brand-400" />
          </div>

          {/* Quick Filter Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">🚗 Todas as Marcas</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Chevrolet">Chevrolet</option>
              <option value="Jeep">Jeep</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Fiat">Fiat</option>
            </select>

            <select
              value={selectedMaxPrice}
              onChange={e => setSelectedMaxPrice(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">💰 Preço Máximo</option>
              <option value="60000">Até R$ 60 mil</option>
              <option value="90000">Até R$ 90 mil</option>
              <option value="120000">Até R$ 120 mil</option>
              <option value="150000">Até R$ 150 mil</option>
              <option value="200000">Até R$ 200 mil</option>
            </select>

            <select
              value={selectedMinYear}
              onChange={e => setSelectedMinYear(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">📅 Ano Mínimo</option>
              <option value="2020">2020+</option>
              <option value="2022">2022+</option>
              <option value="2023">2023+</option>
              <option value="2024">2024+</option>
            </select>

            <select
              value={selectedTransmission}
              onChange={e => setSelectedTransmission(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">⚙️ Câmbio</option>
              <option value="Automático">Automático</option>
              <option value="CVT">CVT</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-base shadow-xl shadow-brand-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <Search className="w-5 h-5" />
            <span>Buscar Carros Agora</span>
          </button>
        </form>

        {/* Quick Example Searches */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400">Exemplos de busca rápida:</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {searchExamples.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(ex);
                  router.push(`/busca?search=${encodeURIComponent(ex)}`);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Market Statistics Bar */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <span className="block text-2xl sm:text-3xl font-black text-emerald-400">Tabela FIPE</span>
          <span className="text-xs text-slate-400 font-medium">Benchmark em Tempo Real</span>
        </div>
        <div>
          <span className="block text-2xl sm:text-3xl font-black text-brand-400">1-Clique</span>
          <span className="text-xs text-slate-400 font-medium">Link Direto para o Anúncio</span>
        </div>
        <div>
          <span className="block text-2xl sm:text-3xl font-black text-amber-400">0 a 10</span>
          <span className="text-xs text-slate-400 font-medium">Avaliação AutoBusca</span>
        </div>
        <div>
          <span className="block text-2xl sm:text-3xl font-black text-purple-400">Sem Duplicatas</span>
          <span className="text-xs text-slate-400 font-medium">Busca Unificada Limpa</span>
        </div>
      </section>

      {/* Hot Deals Showcase */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">🔥 Melhores Oportunidades</h2>
              <p className="text-xs sm:text-sm text-slate-400">Carros com preço abaixo da Tabela FIPE e da média de mercado</p>
            </div>
          </div>

          <Link
            href="/oportunidades"
            className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
          >
            <span>Ver todas as oportunidades</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotDeals.map(ad => (
            <CarCard key={ad.id} ad={ad} />
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="max-w-3xl space-y-3">
          <h3 className="text-2xl sm:text-3xl font-black text-white italic">
            &ldquo;Nós encontramos os carros. Você descobre quais realmente valem a pena.&rdquo;
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed">
            Comparamos o preço de cada anúncio diretamente com a Tabela FIPE e com outros anúncios do mesmo modelo para ajudar você a decidir rápido e acessar o link original sem perda de tempo.
          </p>
        </div>
      </section>
    </div>
  );
}
