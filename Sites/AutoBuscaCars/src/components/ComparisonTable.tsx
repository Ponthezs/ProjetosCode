'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CarAd } from '../lib/types';
import { analyzeCarPrice } from '../lib/engine/priceAnalyzer';
import { evaluateCarAd } from '../lib/engine/aiEvaluator';
import { useApp } from '../context/AppContext';
import { X, ExternalLink, Star, Trophy } from 'lucide-react';

interface ComparisonTableProps {
  cars: CarAd[];
}

export default function ComparisonTable({ cars }: ComparisonTableProps) {
  const { toggleCompare } = useApp();

  if (cars.length === 0) {
    return (
      <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          ⚖️
        </div>
        <h3 className="text-xl font-bold text-white">Nenhum veículo selecionado para comparação</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Navegue pelas buscas e clique no botão <strong>&ldquo;Comparar&rdquo;</strong> nos cards para selecionar até 4 carros e comparar suas especificações lado a lado.
        </p>
        <Link
          href="/busca"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all"
        >
          Buscar Carros para Comparar
        </Link>
      </div>
    );
  }

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const formatKm = (km: number) => `${km.toLocaleString('pt-BR')} km`;

  // Calculate best indexes for automatic green highlighting
  const minPrice = Math.min(...cars.map(c => c.price));
  const minKm = Math.min(...cars.map(c => c.mileage));
  const maxYear = Math.max(...cars.map(c => c.year));

  const carScores = cars.map(c => {
    const p = analyzeCarPrice(c);
    return evaluateCarAd(c, p).totalScore;
  });
  const maxScore = Math.max(...carScores);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800">
              <th className="p-4 w-48 text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                Característica
              </th>
              {cars.map((car, index) => {
                const p = analyzeCarPrice(car);
                const score = evaluateCarAd(car, p);
                const isBestScore = score.totalScore === maxScore;

                return (
                  <th key={car.id} className="p-4 text-slate-100 min-w-[220px] align-top relative border-l border-slate-800/60">
                    <button
                      onClick={() => toggleCompare(car.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remover da comparação"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="space-y-2">
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-950">
                        <Image
                          src={car.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'}
                          alt={car.title}
                          fill
                          className="object-cover"
                        />
                        {isBestScore && (
                          <div className="absolute top-2 left-2 bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <Trophy className="w-3 h-3" />
                            Melhor Score
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">{car.brand}</span>
                        <h4 className="font-extrabold text-base text-white line-clamp-1">{car.model}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{car.version}</p>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-sm">
            {/* Row: Preço */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Preço</td>
              {cars.map(car => {
                const isBest = car.price === minPrice;
                return (
                  <td key={car.id} className={`p-4 font-extrabold border-l border-slate-800/60 ${isBest ? 'bg-emerald-950/30 text-emerald-300' : 'text-white'}`}>
                    <div className="flex items-center gap-1.5">
                      <span>{formatBRL(car.price)}</span>
                      {isBest && <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">Menor preço</span>}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row: Score Geral */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Score do Veículo</td>
              {cars.map(car => {
                const p = analyzeCarPrice(car);
                const s = evaluateCarAd(car, p);
                const isBest = s.totalScore === maxScore;
                return (
                  <td key={car.id} className={`p-4 border-l border-slate-800/60 ${isBest ? 'bg-emerald-950/30' : ''}`}>
                    <div className="flex items-center gap-1.5 font-black text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{s.totalScore.toFixed(1)} / 10</span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row: Ano */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Ano</td>
              {cars.map(car => {
                const isBest = car.year === maxYear;
                return (
                  <td key={car.id} className={`p-4 border-l border-slate-800/60 ${isBest ? 'bg-emerald-950/30 text-emerald-300 font-bold' : 'text-slate-200'}`}>
                    {car.year} / {car.modelYear}
                  </td>
                );
              })}
            </tr>

            {/* Row: Quilometragem */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Quilometragem</td>
              {cars.map(car => {
                const isBest = car.mileage === minKm;
                return (
                  <td key={car.id} className={`p-4 border-l border-slate-800/60 ${isBest ? 'bg-emerald-950/30 text-emerald-300 font-bold' : 'text-slate-200'}`}>
                    <div className="flex items-center gap-1.5">
                      <span>{formatKm(car.mileage)}</span>
                      {isBest && <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">Menor KM</span>}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row: Motor */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Motor</td>
              {cars.map(car => (
                <td key={car.id} className="p-4 text-slate-200 border-l border-slate-800/60">
                  {car.engine}
                </td>
              ))}
            </tr>

            {/* Row: Potência */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Potência</td>
              {cars.map(car => (
                <td key={car.id} className="p-4 text-slate-200 border-l border-slate-800/60 font-semibold">
                  {car.power}
                </td>
              ))}
            </tr>

            {/* Row: Câmbio */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Câmbio</td>
              {cars.map(car => (
                <td key={car.id} className="p-4 text-slate-200 border-l border-slate-800/60">
                  {car.transmission}
                </td>
              ))}
            </tr>

            {/* Row: Combustível */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Combustível</td>
              {cars.map(car => (
                <td key={car.id} className="p-4 text-slate-200 border-l border-slate-800/60">
                  {car.fuel}
                </td>
              ))}
            </tr>

            {/* Row: Localização */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Localização</td>
              {cars.map(car => (
                <td key={car.id} className="p-4 text-slate-200 border-l border-slate-800/60">
                  {car.location.city} - {car.location.state}
                </td>
              ))}
            </tr>

            {/* Row: Fonte */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Plataforma Origem</td>
              {cars.map(car => (
                <td key={car.id} className="p-4 border-l border-slate-800/60">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-brand-300">
                    {car.source}
                  </span>
                </td>
              ))}
            </tr>

            {/* Row: Link Ação */}
            <tr>
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Ação</td>
              {cars.map(car => (
                <td key={car.id} className="p-4 border-l border-slate-800/60">
                  <Link
                    href={`/carro/${car.id}`}
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md"
                  >
                    <span>Ver Detalhes</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
