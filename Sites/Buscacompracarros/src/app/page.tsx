'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CarCard from '../components/CarCard';
import { mockCarAds } from '../lib/data/mockCars';
import { analyzeCarPrice, calculateDealOpportunity } from '../lib/engine/priceAnalyzer';
import { Search, Flame, Sparkles, ShieldCheck, ArrowRight, DollarSign, Calendar, Car, Cog, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Quick filter dropdowns state on home
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

  // Top 3 Hot Deals for showcase
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
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-4 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold shadow-inner">
          <Sparkles className="w-4 h-4" />
          <span>Pesquisa Inteligente & Avaliação por IA</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Encontre seu <span className="bg-gradient-to-r from-brand-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">próximo carro</span> com a melhor oportunidade
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Pesquisamos anúncios de sites e marketplaces conhecidos em uma única interface, analisamos os preços e avaliamos as descrições para você.
        </p>

        {/* Centralized Search Box */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
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

          {/* Submit CTA Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-black text-base shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Search className="w-5 h-5" />
            <span>Buscar Carros Agora</span>
          </button>
        </form>

        {/* Quick Example Searches */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400">Exemplos populares de busca:</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {searchExamples.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(ex);
                  router.push(`/busca?search=${encodeURIComponent(ex)}`);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-700 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Market Statistics Bar */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <span className="block text-2xl sm:text-3xl font-black text-brand-400">100% Legais</span>
          <span className="text-xs text-slate-400 font-medium">Fontes & Feeds Autorizados</span>
        </div>
        <div>
          <span className="block text-2xl sm:text-3xl font-black text-emerald-400">R$ 4.600</span>
          <span className="text-xs text-slate-400 font-medium">Economia Média Encontrada</span>
        </div>
        <div>
          <span className="block text-2xl sm:text-3xl font-black text-amber-400">IA 0-10</span>
          <span className="text-xs text-slate-400 font-medium">Score Computacional</span>
        </div>
        <div>
          <span className="block text-2xl sm:text-3xl font-black text-purple-400">Deduplicado</span>
          <span className="text-xs text-slate-400 font-medium">Sem Anúncios Repetidos</span>
        </div>
      </section>

      {/* Hot Deals Showcase ("Melhores Oportunidades") */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">🔥 Melhores Oportunidades do Dia</h2>
              <p className="text-xs sm:text-sm text-slate-400">Anúncios com preço significativamente abaixo da média de mercado</p>
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

      {/* Brand Value Differential Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>O grande diferencial do AutoBusca</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white italic">
            &ldquo;Nós encontramos os carros. Você descobre quais realmente valem a pena.&rdquo;
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed">
            Cruzamos preço, ano, quilometragem, versão, equipamentos e analisamos semanticamente as descrições dos anúncios para destacar possíveis boas compras com clareza e transparência.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold text-sm">🟢 Análise de Preço</div>
            <p className="text-xs text-slate-400">Comparação em tempo real com a média real de mercado.</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-amber-400 font-bold text-sm">⭐ Score Inteligente</div>
            <p className="text-xs text-slate-400">Nota de 0 a 10 calculada em 6 fatores essenciais.</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-cyan-400 font-bold text-sm">📝 Análise da Descrição</div>
            <p className="text-xs text-slate-400">Extração de pontos positivos e alertas de omissão no texto.</p>
          </div>
        </div>
      </section>

      {/* How it works summary */}
      <section className="text-center space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-white">Como Funciona a Busca Simplificada</h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-left">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-black text-sm flex items-center justify-center">1</span>
            <h4 className="font-bold text-sm text-white">Pesquise o Carro</h4>
            <p className="text-xs text-slate-400">Informe modelo, versão, ano ou faixa de preço desejada.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-black text-sm flex items-center justify-center">2</span>
            <h4 className="font-bold text-sm text-white">Encontra Anúncios</h4>
            <p className="text-xs text-slate-400">Reúne dados de múltiplos marketplaces parceiros.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-black text-sm flex items-center justify-center">3</span>
            <h4 className="font-bold text-sm text-white">Compara Preços</h4>
            <p className="text-xs text-slate-400">Calcula a média real e indica a faixa de desconto.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-black text-sm flex items-center justify-center">4</span>
            <h4 className="font-bold text-sm text-white">Análise da IA</h4>
            <p className="text-xs text-slate-400">Identifica histórico de revisões, pontos positivos e alertas.</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-black text-sm flex items-center justify-center">5</span>
            <h4 className="font-bold text-sm text-white">Abra o Anúncio</h4>
            <p className="text-xs text-slate-400">Acesse diretamente o site de origem com total segurança.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
