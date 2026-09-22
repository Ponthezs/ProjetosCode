import { useGame } from '../store/gameStore';

/**
 * Paleta de dados validada (ordem fixa, segura para daltonismo nos pares adjacentes).
 * Cor segue a entidade — nunca a posição.
 */
const SERIES = {
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
};
const SEQ = ['#cde2fb', '#b7d3f6', '#9ec5f4', '#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95', '#104281', '#0d366b'];
export const STATUS = { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' };

export function useChartTheme() {
  const theme = useGame((s) => s.settings.theme);
  const dark = theme === 'dark';
  return {
    dark,
    series: dark ? SERIES.dark : SERIES.light,
    seq: SEQ,
    grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.07)',
    axis: dark ? '#8b93a8' : '#58627a',
    surface: dark ? '#0e1320' : '#ffffff',
    text: dark ? '#e8ebf4' : '#0e1526',
  };
}

/** Rampa sequencial (azul): 0 → claro/transparente, 1 → escuro */
export function seqColor(t: number, dark: boolean): string {
  if (t <= 0.001) return dark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)';
  const steps = dark ? SEQ.slice(3, 12).reverse() : SEQ.slice(2, 13);
  const i = Math.min(steps.length - 1, Math.floor(t * steps.length));
  return steps[i];
}
