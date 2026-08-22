import React from 'react';
import { AIScore } from '../lib/types';
import { Star, ShieldAlert } from 'lucide-react';

interface ScoreGaugeProps {
  score: AIScore;
  compact?: boolean;
}

export default function ScoreGauge({ score, compact = false }: ScoreGaugeProps) {
  const { totalScore, breakdown } = score;

  const getScoreColor = (val: number) => {
    if (val >= 8.5) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 7.0) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (val >= 5.5) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getBarWidth = (val: number) => `${Math.min(100, Math.max(10, val * 10))}%`;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${getScoreColor(totalScore)}`}>
        <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
        <span>Avaliação AutoBusca: {totalScore.toFixed(1)}/10</span>
      </div>
    );
  }

  const items = [
    { label: 'Preço & Valor', value: breakdown.price },
    { label: 'Custo-benefício Geral', value: breakdown.costBenefit },
    { label: 'Quilometragem x Ano', value: breakdown.mileage },
    { label: 'Ano de Fabricação', value: breakdown.year },
    { label: 'Equipamentos de Série', value: breakdown.features },
    { label: 'Clareza do Anúncio', value: breakdown.descriptionQuality },
  ];

  return (
    <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
      {/* Header Total Score */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-white">Avaliação Geral do Veículo</h3>
          <p className="text-xs text-slate-400">Índice sintético baseado em dados do mercado e do anúncio</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${getScoreColor(totalScore)} shadow-sm`}>
          <Star className="w-6 h-6 fill-current text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Nota AutoBusca</span>
            <span className="text-xl font-black tracking-tight text-white">{totalScore.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 10</span></span>
          </div>
        </div>
      </div>

      {/* Sub-scores grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.label} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span>{item.label}</span>
              <span className="font-bold text-slate-100">{item.value.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.value >= 8.5
                    ? 'bg-emerald-500'
                    : item.value >= 7.0
                    ? 'bg-blue-500'
                    : item.value >= 5.5
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: getBarWidth(item.value) }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Clear Disclaimer */}
      <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Importante:</strong> Esta nota é uma estimativa calculada com base nos dados disponibilizados pelo vendedor e nos valores médios praticados no mercado. Recomendamos realizar vistoria cautelar e inspeção mecânica prévia.
        </span>
      </div>
    </div>
  );
}
