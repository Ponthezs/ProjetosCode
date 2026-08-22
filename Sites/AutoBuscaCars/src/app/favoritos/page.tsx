'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { mockCarAds } from '../../lib/data/mockCars';
import CarCard from '../../components/CarCard';
import { Heart, Search, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites } = useApp();

  const favoriteCars = mockCarAds.filter(c => favorites.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Meus Carros Favoritos</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Acompanhe alterações de preço e disponibilidade dos anúncios que você salvou ({favoriteCars.length} salvos)
            </p>
          </div>
        </div>
      </div>

      {favoriteCars.length === 0 ? (
        <div className="bg-slate-900/80 p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-rose-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Nenhum veículo salvo ainda</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Clique no ícone de coração nos anúncios durante suas pesquisas para salvar seus modelos favoritos aqui.
          </p>
          <Link
            href="/busca"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg"
          >
            <Search className="w-4 h-4" />
            <span>Explorar Anúncios</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteCars.map(ad => (
            <CarCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  );
}
