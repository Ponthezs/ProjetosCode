import { CarAd, PriceAnalysis, PriceStatus, FipeStatus } from '../types';
import { mockCarAds } from '../data/mockCars';

export function analyzeCarPrice(ad: CarAd, allAds: CarAd[] = mockCarAds): PriceAnalysis {
  const comparables = allAds.filter(
    item =>
      item.brand.toLowerCase() === ad.brand.toLowerCase() &&
      item.model.toLowerCase() === ad.model.toLowerCase() &&
      Math.abs(item.year - ad.year) <= 1
  );

  let marketAverage: number;
  let minMarketPrice: number;
  let maxMarketPrice: number;

  if (comparables.length > 0) {
    const prices = comparables.map(c => c.price);
    const sum = prices.reduce((acc, p) => acc + p, 0);
    marketAverage = Math.round(sum / prices.length);
    minMarketPrice = Math.min(...prices);
    maxMarketPrice = Math.max(...prices);
  } else {
    marketAverage = Math.round(ad.price * 1.04);
    minMarketPrice = Math.round(ad.price * 0.90);
    maxMarketPrice = Math.round(ad.price * 1.15);
  }

  if (minMarketPrice >= ad.price) {
    minMarketPrice = Math.round(ad.price * 0.92);
  }
  if (maxMarketPrice <= ad.price) {
    maxMarketPrice = Math.round(ad.price * 1.08);
  }

  const difference = ad.price - marketAverage;
  const differencePercent = Number(((difference / marketAverage) * 100).toFixed(1));

  let status: PriceStatus;
  let statusLabel: string;

  if (differencePercent <= -6.0) {
    status = 'excellent';
    statusLabel = 'Excelente Preço';
  } else if (differencePercent <= -1.5) {
    status = 'good';
    statusLabel = 'Abaixo da Média';
  } else if (differencePercent <= 4.0) {
    status = 'average';
    statusLabel = 'Na Média do Mercado';
  } else {
    status = 'high';
    statusLabel = 'Acima da Média';
  }

  // --- TABELA FIPE CALCULATION ---
  const fipePrice = ad.fipePrice || Math.round(ad.price * 1.03);
  const fipeDifference = ad.price - fipePrice;
  const fipeDifferencePercent = Number(((fipeDifference / fipePrice) * 100).toFixed(1));

  let fipeStatus: FipeStatus;
  let fipeStatusLabel: string;

  if (fipeDifferencePercent <= -1.5) {
    fipeStatus = 'below_fipe';
    fipeStatusLabel = `${Math.abs(fipeDifference).toLocaleString('pt-BR')} abaixo da FIPE`;
  } else if (fipeDifferencePercent <= 1.5) {
    fipeStatus = 'at_fipe';
    fipeStatusLabel = 'Na Tabela FIPE';
  } else {
    fipeStatus = 'above_fipe';
    fipeStatusLabel = `${fipeDifference.toLocaleString('pt-BR')} acima da FIPE`;
  }

  const range = maxMarketPrice - minMarketPrice;
  let percentileRank = range > 0 ? ((ad.price - minMarketPrice) / range) * 100 : 50;
  percentileRank = Math.max(5, Math.min(95, Math.round(percentileRank)));

  return {
    status,
    statusLabel,
    marketAverage,
    difference,
    differencePercent,
    minMarketPrice,
    maxMarketPrice,
    percentileRank,
    fipePrice,
    fipeDifference,
    fipeDifferencePercent,
    fipeStatus,
    fipeStatusLabel,
  };
}

export function calculateDealOpportunity(ad: CarAd, analysis: PriceAnalysis) {
  let dealScore = 50;

  if (analysis.fipeDifferencePercent < 0) {
    dealScore += Math.min(30, Math.round(Math.abs(analysis.fipeDifferencePercent) * 4));
  } else {
    dealScore -= Math.min(20, Math.round(analysis.fipeDifferencePercent * 3));
  }

  if (analysis.differencePercent < 0) {
    dealScore += Math.min(15, Math.round(Math.abs(analysis.differencePercent) * 2));
  }

  const expectedKm = (2026 - ad.year) * 15000;
  if (expectedKm > 0) {
    const kmRatio = ad.mileage / expectedKm;
    if (kmRatio < 0.7) dealScore += 10;
    else if (kmRatio > 1.3) dealScore -= 10;
  }

  if (ad.seller.verified) dealScore += 5;
  if (ad.features.length >= 6) dealScore += 5;

  dealScore = Math.max(10, Math.min(99, dealScore));

  const savingsAmount = analysis.fipeDifference < 0 ? Math.abs(analysis.fipeDifference) : 0;
  const savingsPercent = analysis.fipeDifferencePercent < 0 ? Math.abs(analysis.fipeDifferencePercent) : 0;

  return {
    dealScore,
    savingsAmount,
    savingsPercent,
    isHotDeal: dealScore >= 80 || savingsAmount >= 4000,
  };
}
