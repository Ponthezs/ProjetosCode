import React from 'react';
import Link from 'next/link';
import { Search, Database, Scale, Cpu, Flame, ShieldCheck, ExternalLink, ArrowDown } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '1',
      title: 'Você pesquisa o carro',
      desc: 'Informe o modelo, versão, ano ou limite de preço que você deseja. Exemplo: "Corolla XEi 2022 até R$ 120.000".',
      icon: Search,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
    },
    {
      num: '2',
      title: 'O sistema encontra anúncios disponíveis',
      desc: 'Buscamos e consolidamos dados de marketplaces automotivos autorizados (Webmotors, OLX, iCarros, AutoLine), eliminando duplicatas.',
      icon: Database,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      num: '3',
      title: 'Comparamos preços e especificações',
      desc: 'Calculamos a média de mercado do veículo e classificamos visualmente (🟢 Excelente, 🔵 Bom, 🟡 Média, 🔴 Elevado) com variação em R$.',
      icon: Scale,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      num: '4',
      title: 'A IA analisa as informações do anúncio',
      desc: 'Analisamos sintaticamente a descrição para extrair pontos positivos (revisões, único dono, pneus novos) e apontar o que não foi informado.',
      icon: Cpu,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      num: '5',
      title: 'Você encontra as melhores oportunidades',
      desc: 'Acesse a nota do veículo (0-10), compare lado a lado e clique em "Ver anúncio" para ser direcionado à plataforma original.',
      icon: Flame,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Metodologia & Transparência</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Como Funciona o <span className="text-brand-400">AutoBusca</span>
        </h1>

        <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Entenda como cruzamos dados de mercado, precificação e análise de texto por inteligência computacional para te ajudar a encontrar boas oportunidades.
        </p>
      </div>

      {/* 5-Step Process Vertical Timeline */}
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.num}>
              <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start gap-5">
                <div className={`p-4 rounded-2xl border ${step.color} shrink-0`}>
                  <Icon className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Passo {step.num} de 5</span>
                  <h3 className="text-xl font-extrabold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{step.desc}</p>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowDown className="w-6 h-6 text-slate-600 animate-bounce" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Disclaimer Box */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Compromisso com a Transparência
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          O <strong>Score do Veículo (0-10)</strong> e as classificações de preço são estimativas estatísticas baseadas estritamente nas informações declaradas no anúncio pelo vendedor e nos valores médios de mercado.
        </p>

        <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800 italic">
          &ldquo;Nossa análise não substitui vistoria física prévia, inspeção mecânica por profissional qualificado ou verificação de débitos e histórico de sinistro junto ao DETRAN.&rdquo;
        </p>
      </div>

      {/* Call to action */}
      <div className="text-center pt-4">
        <Link
          href="/busca"
          className="inline-flex items-center gap-2 py-4 px-8 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-base shadow-xl shadow-brand-600/30 transition-all transform hover:-translate-y-0.5"
        >
          <span>Experimentar a Busca Agora</span>
          <ExternalLink className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
