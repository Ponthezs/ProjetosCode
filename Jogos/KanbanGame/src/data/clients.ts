import type { ClientDef, Segment } from '../types';

export const SEGMENT_META: Record<Segment, { label: string; icon: string; color: string }> = {
  startup: { label: 'Startup', icon: 'Rocket', color: '#a78bfa' },
  bank: { label: 'Banco', icon: 'Landmark', color: '#60a5fa' },
  hospital: { label: 'Hospital', icon: 'Hospital', color: '#f87171' },
  healthplan: { label: 'Operadora de Saúde', icon: 'HeartPulse', color: '#fb7185' },
  fintech: { label: 'Fintech', icon: 'Wallet', color: '#34d399' },
  retail: { label: 'Varejo', icon: 'Store', color: '#fbbf24' },
  industry: { label: 'Indústria', icon: 'Factory', color: '#f97316' },
  government: { label: 'Governo', icon: 'Building', color: '#94a3b8' },
  ecommerce: { label: 'E-commerce', icon: 'ShoppingCart', color: '#22d3ee' },
  saas: { label: 'SaaS B2B', icon: 'Briefcase', color: '#818cf8' },
};

/** 15 clientes fictícios */
export const CLIENTS: ClientDef[] = [
  { id: 'c01', name: 'Nimbus Labs', segment: 'startup', tolerance: 4, budgetMult: 0.8, slaDays: 12, priorityWeight: 1, complexityMult: 0.85, strictness: 0.7, description: 'Startup em crescimento acelerado. Aceita riscos, quer velocidade.' },
  { id: 'c02', name: 'Banco Atlântico', segment: 'bank', tolerance: 1, budgetMult: 1.5, slaDays: 10, priorityWeight: 1.4, complexityMult: 1.25, strictness: 1.6, description: 'Banco tradicional com forte regulação e auditorias frequentes.' },
  { id: 'c03', name: 'Hospital Vida Plena', segment: 'hospital', tolerance: 1, budgetMult: 1.3, slaDays: 9, priorityWeight: 1.5, complexityMult: 1.15, strictness: 1.8, description: 'Falhas afetam atendimento a pacientes. Tolerância mínima.' },
  { id: 'c04', name: 'Saúde Integral+', segment: 'healthplan', tolerance: 2, budgetMult: 1.2, slaDays: 11, priorityWeight: 1.2, complexityMult: 1.2, strictness: 1.3, description: 'Operadora com dezenas de integrações com prestadores.' },
  { id: 'c05', name: 'PayWave', segment: 'fintech', tolerance: 2, budgetMult: 1.35, slaDays: 9, priorityWeight: 1.3, complexityMult: 1.1, strictness: 1.4, description: 'Fintech de pagamentos com alto volume transacional.' },
  { id: 'c06', name: 'Rede Horizonte', segment: 'retail', tolerance: 3, budgetMult: 1, slaDays: 12, priorityWeight: 1, complexityMult: 0.95, strictness: 1, description: 'Rede varejista com 300 lojas físicas.' },
  { id: 'c07', name: 'MetalSul Indústria', segment: 'industry', tolerance: 3, budgetMult: 1.1, slaDays: 14, priorityWeight: 0.9, complexityMult: 1.1, strictness: 0.9, description: 'Indústria digitalizando o chão de fábrica.' },
  { id: 'c08', name: 'Secretaria Digital', segment: 'government', tolerance: 2, budgetMult: 0.9, slaDays: 15, priorityWeight: 1.1, complexityMult: 1.2, strictness: 1.2, description: 'Órgão público com prazos legais e auditorias.' },
  { id: 'c09', name: 'MegaShop', segment: 'ecommerce', tolerance: 2, budgetMult: 1.25, slaDays: 8, priorityWeight: 1.2, complexityMult: 1, strictness: 1.3, description: 'E-commerce de grande porte, sensível a indisponibilidade.' },
  { id: 'c10', name: 'Orbit CRM', segment: 'saas', tolerance: 3, budgetMult: 1.05, slaDays: 11, priorityWeight: 1, complexityMult: 1, strictness: 1, description: 'Plataforma SaaS com milhares de assinantes.' },
  { id: 'c11', name: 'Clínica Bem Estar', segment: 'hospital', tolerance: 2, budgetMult: 0.9, slaDays: 12, priorityWeight: 1.1, complexityMult: 0.9, strictness: 1.2, description: 'Rede de clínicas buscando digitalização.' },
  { id: 'c12', name: 'CrediFácil', segment: 'fintech', tolerance: 3, budgetMult: 1.1, slaDays: 10, priorityWeight: 1.1, complexityMult: 1, strictness: 1.1, description: 'Fintech de crédito pessoal.' },
  { id: 'c13', name: 'Moda Urbana', segment: 'ecommerce', tolerance: 3, budgetMult: 0.9, slaDays: 10, priorityWeight: 0.9, complexityMult: 0.85, strictness: 0.9, description: 'Loja online de moda jovem.' },
  { id: 'c14', name: 'Kappa Seguros', segment: 'healthplan', tolerance: 2, budgetMult: 1.2, slaDays: 12, priorityWeight: 1.1, complexityMult: 1.15, strictness: 1.2, description: 'Seguradora com produtos de saúde e vida.' },
  { id: 'c15', name: 'Sprout.io', segment: 'startup', tolerance: 5, budgetMult: 0.7, slaDays: 14, priorityWeight: 0.8, complexityMult: 0.8, strictness: 0.6, description: 'Startup em fase de validação de produto.' },
];
