'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { mockCarAds } from '../../lib/data/mockCars';
import PriceHistoryChart from '../../components/PriceHistoryChart';
import CarCard from '../../components/CarCard';
import { User, Heart, Bell, Scale, Search, Flame, ArrowRight, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { favorites, compareList, alerts } = useApp();

  const favoriteCars = mockCarAds.filter(c => favorites.includes(c.id));
  const recentOpps = mockCarAds.slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Meu Painel AutoBusca</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Resumo de suas atividades, veículos salvos, alertas configurados e tendências de preço
            </p>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <Link
            href="/favoritos"
            className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-rose-400">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-xl font-black">{favorites.length}</span>
            </div>
            <span className="text-xs text-slate-400 font-bold block">Favoritos Salvos</span>
          </Link>

          <Link
            href="/alertas"
            className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-amber-400">
              <Bell className="w-5 h-5" />
              <span className="text-xl font-black">{alerts.length}</span>
            </div>
            <span className="text-xs text-slate-400 font-bold block">Alertas Ativos</span>
          </Link>

          <Link
            href="/comparar"
            className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-brand-400">
              <Scale className="w-5 h-5" />
              <span className="text-xl font-black">{compareList.length}</span>
            </div>
            <span className="text-xs text-slate-400 font-bold block">No Comparador</span>
          </Link>

          <Link
            href="/oportunidades"
            className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-emerald-400">
              <Flame className="w-5 h-5 fill-current" />
              <span className="text-xl font-black">20+</span>
            </div>
            <span className="text-xs text-slate-400 font-bold block">Oportunidades</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Favorites + Price Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Favorites & Recent Deals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
                Meus Veículos Favoritos
              </h3>
              <Link href="/favoritos" className="text-xs text-brand-400 font-bold hover:underline">
                Ver todos
              </Link>
            </div>

            {favoriteCars.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhum veículo favoritado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteCars.slice(0, 2).map(ad => (
                  <CarCard key={ad.id} ad={ad} compact />
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 fill-current" />
                Últimas Oportunidades no seu Perfil
              </h3>
              <Link href="/oportunidades" className="text-xs text-amber-400 font-bold hover:underline">
                Ver todas
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentOpps.map(ad => (
                <CarCard key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Price Evolution & Active Searches */}
        <div className="space-y-6">
          <PriceHistoryChart modelName="Toyota Corolla / Honda Civic" />

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-400" />
              Minhas Buscas Recentes
            </h3>

            <div className="space-y-2">
              <Link
                href="/busca?search=Corolla+XEi+2022"
                className="block p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <span className="font-bold text-white block">Corolla XEi 2022</span>
                <span className="text-[11px] text-slate-400">Até R$ 120.000 • São Paulo</span>
              </Link>

              <Link
                href="/busca?search=Civic+Touring"
                className="block p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <span className="font-bold text-white block">Honda Civic Touring</span>
                <span className="text-[11px] text-slate-400">2021+ • Turbo 1.5</span>
              </Link>

              <Link
                href="/busca?search=T-Cross+Highline"
                className="block p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <span className="font-bold text-white block">VW T-Cross Highline 2023</span>
                <span className="text-[11px] text-slate-400">Teto Solar • 250 TSI</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
