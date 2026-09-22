export const money = (v: number, compact = false): string => {
  if (compact && Math.abs(v) >= 1000) {
    const k = v / 1000;
    return `R$ ${k.toLocaleString('pt-BR', { maximumFractionDigits: Math.abs(k) >= 100 ? 0 : 1 })}k`;
  }
  return `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
};
export const int = (v: number) => Math.round(v).toLocaleString('pt-BR');
export const dec = (v: number | null | undefined, d = 1) => (v === null || v === undefined || Number.isNaN(v) ? '—' : v.toLocaleString('pt-BR', { maximumFractionDigits: d, minimumFractionDigits: d }));
export const pct = (v: number) => `${Math.round(v)}%`;
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
export const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
export const firstName = (name: string) => name.split(' ')[0];
