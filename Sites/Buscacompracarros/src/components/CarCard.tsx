'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CarAd } from '../lib/types';
import { analyzeCarPrice } from '../lib/engine/priceAnalyzer';
import { evaluateCarAd } from '../lib/engine/aiEvaluator';
import { useApp } from '../context/AppContext';
import { Heart, Scale, MapPin, ExternalLink, ShieldCheck, Flame, Star } from 'lucide-react';

interface CarCardProps {
  ad: CarAd;
  compact?: boolean;
}

export default function CarCard({ ad, compact = false }: CarCardProps) {
  const { isFavorite, toggleFavorite, isComparing, toggleCompare } = useApp();

  const priceAnalysis = analyzeCarPrice(ad);
  const aiScore = evaluateCarAd(ad, priceAnalysis);
  const favorite = isFavorite(ad.id);
  const comparing = isComparing(ad.id);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const formatKm = (km: number) => `${km.toLocaleString('pt-BR')} km`;

  const statusBadge = {
    excellent: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    good: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    average: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  }[priceAnalysis.status];

  const sourceBadgeColor = {
    Webmotors: 'bg-red-500/20 text-red-300 border-red-500/30',
    OLX: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    iCarros: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    AutoLine: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }[ad.source];

  return (
    <div className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Section */}
      <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
        <Image
          src={ad.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={ad.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Source Badge & Hot Deal */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md ${sourceBadgeColor}`}>
            {ad.source}
          </span>
          {priceAnalysis.differencePercent <= -5 && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Oportunidade
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={e => {
            e.preventDefault();
            toggleFavorite(ad.id);
          }}
          aria-label={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          className={`absolute top-3 right-3 p-2.5 rounded-full border backdrop-blur-md transition-all z-10 ${
            favorite
              ? 'bg-rose-500/90 border-rose-400 text-white shadow-lg shadow-rose-500/30'
              : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
        </button>

        {/* AI Score Badge overlay bottom right */}
        <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-700 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>Score {aiScore.totalScore.toFixed(1)}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Model Title */}
          <Link href={`/carro/${ad.id}`} className="block group-hover:text-brand-400 transition-colors">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-100 line-clamp-1">
              {ad.brand} {ad.model}
            </h3>
            <p className="text-xs font-medium text-slate-400 line-clamp-1 -mt-0.5">
              {ad.version}
            </p>
          </Link>

          {/* Quick Specs Bullet List */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-300 font-medium mt-2 pt-2 border-t border-slate-800/80">
            <span>{ad.year}</span>
            <span className="text-slate-600">•</span>
            <span>{formatKm(ad.mileage)}</span>
            <span className="text-slate-600">•</span>
            <span>{ad.transmission}</span>
            <span className="text-slate-600">•</span>
            <span>{ad.fuel}</span>
          </div>
        </div>

        {/* Price & Savings Pill */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {formatBRL(ad.price)}
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge}`}>
              {priceAnalysis.statusLabel}
            </span>
          </div>

          {/* Savings vs Average text */}
          {priceAnalysis.difference < 0 && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              🟢 {formatBRL(Math.abs(priceAnalysis.difference))} abaixo da média encontrada
            </p>
          )}
        </div>

        {/* Seller & Location */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1 truncate max-w-[60%]">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{ad.location.city} - {ad.location.state}</span>
          </div>
          <div className="flex items-center gap-1 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate font-medium text-slate-300">{ad.seller.name}</span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* Compare Checkbox Button */}
          <button
            onClick={() => toggleCompare(ad.id)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
              comparing
                ? 'bg-brand-600/30 text-brand-300 border-brand-500/50'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/70'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{comparing ? 'Comparando' : 'Comparar'}</span>
          </button>

          {/* Detail Link Button */}
          <Link
            href={`/carro/${ad.id}`}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20"
          >
            <span>Ver anúncio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
