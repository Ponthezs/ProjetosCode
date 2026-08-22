import React from 'react';
import Link from 'next/link';
import { Car, ShieldCheck, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-16 mb-16 lg:mb-0">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-md">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-white">
              Auto<span className="text-brand-400">Busca</span>
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-200 italic border-l-2 border-brand-500 pl-3 py-0.5">
            &ldquo;Nós encontramos os carros. Você descobre quais realmente valem a pena.&rdquo;
          </p>

          <p className="text-xs text-slate-400 leading-relaxed pr-4">
            Plataforma web responsiva e mobile-first para pesquisa, comparação de preços e avaliação de anúncios de carros. Consolida dados de marketplaces automotivos permitidos, oferecendo análise visual de preços, avaliação de descrições e cálculo de score.
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Aviso Importante:</strong> O Score (0-10) é uma estimativa baseada nas informações disponibilizadas pelo anúncio. Não substitui vistoria veicular, inspeção mecânica ou consulta documental.
            </span>
          </div>
        </div>

        {/* Fontes Integradas */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Fontes de Dados</h4>
          <p className="text-xs text-slate-400">Integração preparada para feeds e fontes autorizadas:</p>
          <ul className="space-y-2 text-xs font-medium text-slate-300">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
              <span>Webmotors</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span>OLX Carros</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>iCarros</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>AutoLine</span>
            </li>
          </ul>
        </div>

        {/* Navegação Rápida */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Navegação</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/busca" className="hover:text-brand-400 transition-colors">
                Buscar Carros
              </Link>
            </li>
            <li>
              <Link href="/oportunidades" className="hover:text-amber-400 transition-colors text-amber-400 font-semibold">
                🔥 Melhores Oportunidades
              </Link>
            </li>
            <li>
              <Link href="/comparar" className="hover:text-brand-400 transition-colors">
                Comparador Lado a Lado
              </Link>
            </li>
            <li>
              <Link href="/alertas" className="hover:text-brand-400 transition-colors">
                Criar Alertas de Preço
              </Link>
            </li>
            <li>
              <Link href="/como-funciona" className="hover:text-brand-400 transition-colors">
                Como Funciona o Score
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-brand-400 transition-colors">
                Painel do Usuário
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© 2026 AutoBusca. Todos os direitos reservados.</p>
        <div className="flex items-center gap-1">
          <span>Desenvolvido com foco em velocidade e transparência</span>
        </div>
      </div>
    </footer>
  );
}
