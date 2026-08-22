import { CarAd, PriceAnalysis, PriceStatus } from '../types';
import { mockCarAds } from '../data/mockCars';

export function analyzeCarPrice(ad: CarAd, allAds: CarAd[] = mockCarAds): PriceAnalysis {
  // Find comparable ads by brand and model (and year range ±1 year if possible)
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
    // Fallback baseline if no exact model match in mock
    marketAverage = Math.round(ad.price * 1.05); // assume 5% above this ad
    minMarketPrice = Math.round(ad.price * 0.90);
    maxMarketPrice = Math.round(ad.price * 1.18);
  }

  // Ensure reasonable bounds for display spectrum
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
    statusLabel = 'Excelente preço';
  } else if (differencePercent <= -1.5) {
    status = 'good';
    statusLabel = 'Bom preço';
  } else if (differencePercent <= 4.0) {
    status = 'average';
    statusLabel = 'Preço dentro da média';
  } else {
    status = 'high';
    statusLabel = 'Preço elevado';
  }

  // Calculate relative percentile rank 0-100 on price spectrum
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
  };
}

export function calculateDealOpportunity(ad: CarAd, analysis: PriceAnalysis) {
  // Deal score from 0 to 100
  let dealScore = 50;

  // Price factor: up to +35 points for big discounts
  if (analysis.differencePercent < 0) {
    const discountFactor = Math.abs(analysis.differencePercent);
    dealScore += Math.min(35, Math.round(discountFactor * 4));
  } else {
    dealScore -= Math.min(25, Math.round(analysis.differencePercent * 3));
  }

  // Mileage factor: lower km relative to year boosts score
  const expectedKm = (2026 - ad.year) * 15000;
  if (expectedKm > 0) {
    const kmRatio = ad.mileage / expectedKm;
    if (kmRatio < 0.7) dealScore += 10;
    else if (kmRatio > 1.3) dealScore -= 10;
  }

  // Features & Seller factor
  if (ad.seller.verified) dealScore += 5;
  if (ad.features.length >= 6) dealScore += 5;

  dealScore = Math.max(10, Math.min(99, dealScore));

  const savingsAmount = analysis.difference < 0 ? Math.abs(analysis.difference) : 0;
  const savingsPercent = analysis.differencePercent < 0 ? Math.abs(analysis.differencePercent) : 0;

  return {
    dealScore,
    savingsAmount,
    savingsPercent,
    isHotDeal: dealScore >= 80 || savingsAmount >= 5000,
  };
}
