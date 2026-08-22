'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilterState, CarAd } from '../../lib/types';
import { aggregator } from '../../lib/adapters/aggregator';
import CarCard from '../../components/CarCard';
import FilterSidebar from '../../components/FilterSidebar';
import MobileFilterBottomSheet from '../../components/MobileFilterBottomSheet';
import { Search, SlidersHorizontal, ArrowUpDown, Loader2 } from 'lucide-react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    model: searchParams.get('model') || '',
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minYear: searchParams.get('minYear') ? Number(searchParams.get('minYear')) : undefined,
    maxMileage: searchParams.get('maxMileage') ? Number(searchParams.get('maxMileage')) : undefined,
    transmission: searchParams.get('transmission') || '',
    fuel: searchParams.get('fuel') || '',
    bodyType: searchParams.get('bodyType') || '',
    sellerType: searchParams.get('sellerType') || '',
    onlyBelowFipe: searchParams.get('onlyBelowFipe') === 'true',
    sortBy: (searchParams.get('sortBy') as any) || 'cost_benefit',
  });

  const [ads, setAds] = useState<CarAd[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      const results = await aggregator.searchAds(filters);
      setAds(results);
    });
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      brand: '',
      model: '',
      sortBy: 'cost_benefit',
    });
  };

  const activeFilterTags = [
    filters.search && `Busca: "${filters.search}"`,
    filters.brand && `Marca: ${filters.brand}`,
    filters.onlyBelowFipe && `🟢 Abaixo da FIPE`,
    filters.maxPrice && `Até R$ ${(filters.maxPrice / 1000).toFixed(0)}k`,
    filters.minYear && `Ano: ${filters.minYear}+`,
    filters.maxMileage && `Até ${(filters.maxMileage / 1000).toFixed(0)}k km`,
    filters.transmission && `Câmbio: ${filters.transmission}`,
    filters.fuel && `Combustível: ${filters.fuel}`,
    filters.bodyType && `Carroceria: ${filters.bodyType}`,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              placeholder="🔎 Digite marca, modelo ou versão (ex: Corolla XEi 2022)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-brand-400" />
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm border border-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-400" />
            <span>Filtros</span>
            {activeFilterTags.length > 0 && (
              <span className="bg-brand-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterTags.length}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Tags */}
        {activeFilterTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Filtros ativos:</span>
            {activeFilterTags.map((tag, idx) => (
              <span key={idx} className="bg-brand-600/20 text-brand-300 border border-brand-500/30 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                {tag}
              </span>
            ))}
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-400 hover:text-white underline ml-1"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Main Results Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <FilterSidebar filters={filters} onChange={setFilters} onReset={handleResetFilters} />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <div className="text-slate-300 font-medium flex items-center gap-2">
              {isPending && <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />}
              <span>Encontrados <strong className="text-white font-extrabold">{ads.length}</strong> veículos</span>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 hidden sm:inline">Ordenar por:</span>
              <select
                value={filters.sortBy}
                onChange={e => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="cost_benefit">Melhor Custo-Benefício</option>
                <option value="fipe_discount">Maior Desconto vs FIPE</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="mileage_asc">Menor Quilometragem</option>
                <option value="year_desc">Mais Novo</option>
                <option value="score_desc">Melhor Avaliação</option>
              </select>
            </div>
          </div>

          {ads.length === 0 ? (
            <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                🔎
              </div>
              <h3 className="text-xl font-bold text-white">Nenhum veículo encontrado</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Tente ajustar os filtros ou pesquisar por outro modelo.
              </p>
              <button
                onClick={handleResetFilters}
                className="py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {ads.map(ad => (
                <CarCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileFilterBottomSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        resultCount={ads.length}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
          <span>Buscando anúncios...</span>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
