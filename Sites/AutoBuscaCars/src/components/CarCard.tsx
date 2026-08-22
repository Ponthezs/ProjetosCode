'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CarAd } from '../lib/types';
import { analyzeCarPrice } from '../lib/engine/priceAnalyzer';
import { evaluateCarAd } from '../lib/engine/aiEvaluator';
import { useApp } from '../context/AppContext';
import { Heart, Scale, MapPin, ExternalLink, ShieldCheck, Flame, Star, TrendingDown, TrendingUp } from 'lucide-react';

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

  const sourceBadgeColor = {
    Webmotors: 'bg-red-500/20 text-red-300 border-red-500/30',
    OLX: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    iCarros: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    AutoLine: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }[ad.source];

  return (
    <div className="group bg-slate-900 hover:bg-slate-880 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col justify-between">
      {/* Top Image & Floating Badges */}
      <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
        <Image
          src={ad.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={ad.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Source Marketplace Tag */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md ${sourceBadgeColor}`}>
            {ad.source}
          </span>
          {priceAnalysis.fipeDifference < 0 && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md">
              <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
              Abaixo da FIPE
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
              ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/30'
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Intuitive Rating Score overlay bottom right */}
        <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-700 text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>Avaliação {aiScore.totalScore.toFixed(1)}</span>
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

          {/* Specs Bar */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-300 font-medium mt-2 pt-2 border-t border-slate-800">
            <span>{ad.year}</span>
            <span className="text-slate-600">•</span>
            <span>{formatKm(ad.mileage)}</span>
            <span className="text-slate-600">•</span>
            <span>{ad.transmission}</span>
            <span className="text-slate-600">•</span>
            <span>{ad.fuel}</span>
          </div>
        </div>

        {/* Price & TABELA FIPE Benchmark Section */}
        <div className="space-y-1.5 pt-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {formatBRL(ad.price)}
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              FIPE: {formatBRL(priceAnalysis.fipePrice)}
            </span>
          </div>

          {/* FIPE Comparison Indicator */}
          <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-800/60">
            {priceAnalysis.fipeDifference < 0 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                {formatBRL(Math.abs(priceAnalysis.fipeDifference))} abaixo da FIPE ({Math.abs(priceAnalysis.fipeDifferencePercent)}%)
              </span>
            ) : priceAnalysis.fipeDifference === 0 ? (
              <span className="text-blue-400">No valor exato da FIPE</span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {formatBRL(priceAnalysis.fipeDifference)} acima da FIPE (+{priceAnalysis.fipeDifferencePercent}%)
              </span>
            )}
          </div>
        </div>

        {/* Seller & Location */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1 truncate max-w-[60%]">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{ad.location.city} - {ad.location.state}</span>
          </div>
          <div className="flex items-center gap-1 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate font-medium text-slate-300">{ad.seller.name}</span>
          </div>
        </div>

        {/* FAST ACTION BUTTONS: Detail View + INSTANT DIRECT SOURCE LINK */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Internal Details View */}
          <Link
            href={`/carro/${ad.id}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <span>Ver Ficha</span>
          </Link>

          {/* INSTANT DIRECT EXTERNAL SOURCE LINK */}
          <a
            href={ad.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-extrabold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20"
            title={`Abrir anúncio original diretamente no ${ad.source}`}
          >
            <span>Ver no {ad.source}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
