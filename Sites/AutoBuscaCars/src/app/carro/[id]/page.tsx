'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { mockCarAds } from '../../../lib/data/mockCars';
import { analyzeCarPrice } from '../../../lib/engine/priceAnalyzer';
import { evaluateCarAd } from '../../../lib/engine/aiEvaluator';
import { useApp } from '../../../context/AppContext';
import PriceRangeBar from '../../../components/PriceRangeBar';
import ScoreGauge from '../../../components/ScoreGauge';
import PriceHistoryChart from '../../../components/PriceHistoryChart';
import {
  Heart,
  Scale,
  ExternalLink,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  Share2,
  Calendar,
  Gauge,
  Fuel,
  Cog,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const ad = mockCarAds.find(c => c.id === params.id);
  if (!ad) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">Veículo não encontrado</h2>
        <Link href="/busca" className="text-brand-400 underline">Voltar para a busca</Link>
      </div>
    );
  }

  const { isFavorite, toggleFavorite, isComparing, toggleCompare, showToast } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const priceAnalysis = analyzeCarPrice(ad, mockCarAds);
  const aiScore = evaluateCarAd(ad, priceAnalysis);
  const favorite = isFavorite(ad.id);
  const comparing = isComparing(ad.id);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const formatKm = (km: number) => `${km.toLocaleString('pt-BR')} km`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link do veículo copiado!', 'info');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/busca"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar para busca</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleCompare(ad.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              comparing ? 'bg-brand-600/30 text-brand-300 border-brand-500/50' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{comparing ? 'Comparando' : 'Comparar'}</span>
          </button>
          <button
            onClick={() => toggleFavorite(ad.id)}
            className={`p-2 rounded-xl border transition-colors ${
              favorite ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Title & Location Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="bg-brand-600/20 text-brand-300 border border-brand-500/30 px-2.5 py-1 rounded-lg">
            {ad.brand}
          </span>
          <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg">
            Anúncio publicado em: {ad.source}
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {ad.location.city} - {ad.location.state}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white">{ad.title}</h1>
        <p className="text-sm text-slate-400">{ad.version}</p>
      </div>

      {/* Main Grid: Gallery + Purchasing Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery Section */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
            <Image
              src={ad.images[activeImageIndex] || ad.images[0]}
              alt={ad.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          {ad.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {ad.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-brand-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Foto ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Box: Price & Direct Link */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Preço Solicitado</span>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {formatBRL(ad.price)}
              </div>

              {/* Explicit Tabela FIPE Benchmark */}
              <div className="pt-2">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Tabela FIPE oficial:</span>
                    <strong className="text-white">{formatBRL(priceAnalysis.fipePrice)}</strong>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span>Comparativo FIPE:</span>
                    {priceAnalysis.fipeDifference < 0 ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {formatBRL(Math.abs(priceAnalysis.fipeDifference))} abaixo
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {formatBRL(priceAnalysis.fipeDifference)} acima
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Spectrum Bar */}
            <PriceRangeBar price={ad.price} analysis={priceAnalysis} showDetails={false} />

            {/* Quick Specs Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-normal">Ano</span>
                  <span>{ad.year} / {ad.modelYear}</span>
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-normal">KM</span>
                  <span>{formatKm(ad.mileage)}</span>
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Cog className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-normal">Câmbio</span>
                  <span>{ad.transmission}</span>
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-normal">Combustível</span>
                  <span>{ad.fuel}</span>
                </div>
              </div>
            </div>

            {/* Seller info */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  {ad.seller.name}
                </span>
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded">
                  {ad.seller.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Anúncio veiculado no {ad.source}</p>
            </div>
          </div>

          {/* INSTANT DIRECT EXTERNAL LINK CTA */}
          <div className="space-y-2 pt-2">
            <a
              href={ad.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-base shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Abrir anúncio original no {ad.source}</span>
              <ExternalLink className="w-5 h-5" />
            </a>
            <p className="text-[10px] text-center text-slate-400">
              Acesso direto instantâneo à página do vendedor no {ad.source}.
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ScoreGauge score={aiScore} />

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">Análise da Descrição do Vendedor</h3>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Destaques Positivos Mencionados ({aiScore.positivePoints.length})
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {aiScore.positivePoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-800/40">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Pontos de Atenção & Omissões ({aiScore.attentionPoints.length})
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {aiScore.attentionPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/40">
                    <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-bold">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Transparência da Informação</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-extrabold text-brand-400 uppercase block mb-1">DADO INFORMADO PELO ANÚNCIO</span>
                  <p className="text-[11px] text-slate-300">
                    Preço, ano, quilometragem, fotos e texto fornecidos diretamente no {ad.source}.
                  </p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase block mb-1">ESTIMATIVA DO SISTEMA</span>
                  <p className="text-[11px] text-slate-300">
                    Comparativo com Tabela FIPE, média de mercado e análise de pontos positivos/atenção.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Texto do Anúncio</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
                &ldquo;{ad.description}&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Especificações Técnicas
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Marca / Modelo</span>
                <span className="font-bold text-white">{ad.brand} {ad.model}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Tabela FIPE</span>
                <span className="font-bold text-emerald-400">{formatBRL(ad.fipePrice)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Versão</span>
                <span className="font-medium text-slate-200">{ad.version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Motor</span>
                <span className="font-medium text-slate-200">{ad.engine}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Potência</span>
                <span className="font-bold text-emerald-400">{ad.power}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Câmbio</span>
                <span className="font-medium text-slate-200">{ad.transmission}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Combustível</span>
                <span className="font-medium text-slate-200">{ad.fuel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Carroceria</span>
                <span className="font-medium text-slate-200">{ad.bodyType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Cor</span>
                <span className="font-medium text-slate-200">{ad.color}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Portas</span>
                <span className="font-medium text-slate-200">{ad.doors}</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Itens Mencionados</h4>
              <div className="flex flex-wrap gap-1.5">
                {ad.features.map((feat, idx) => (
                  <span key={idx} className="bg-slate-950 text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-800">
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <PriceHistoryChart modelName={`${ad.brand} ${ad.model}`} />
        </div>
      </div>
    </div>
  );
}
