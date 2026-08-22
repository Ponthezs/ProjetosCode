import { CarAd, AIScore, PriceAnalysis } from '../types';

export function evaluateCarAd(ad: CarAd, priceAnalysis: PriceAnalysis): AIScore {
  const descLower = ad.description.toLowerCase();

  const positivePoints: string[] = [];
  const attentionPoints: string[] = [];

  // --- Positive points detection ---
  if (descLower.includes('revisõ') || descLower.includes('revisao') || descLower.includes('concessionária') || descLower.includes('concessionaria')) {
    positivePoints.push('Revisões registradas ou mencionadas em concessionária.');
  }

  if (descLower.includes('único dono') || descLower.includes('única dona') || descLower.includes('unico dono') || descLower.includes('unica dona')) {
    positivePoints.push('Declarado como único dono pelo vendedor.');
  }

  if (descLower.includes('manual') || descLower.includes('chave reserva') || descLower.includes('chave cópia')) {
    positivePoints.push('Possui manual do proprietário e/ou chave reserva.');
  }

  if (descLower.includes('laudo') || descLower.includes('cautelar') || descLower.includes('periciado')) {
    positivePoints.push('Laudo cautelar/pericial mencionado como aprovado.');
  }

  if (descLower.includes('pneu') || descLower.includes('pneus novos') || descLower.includes('semimovo') || descLower.includes('semi-novo')) {
    positivePoints.push('Indicativo de conservação recente dos pneus ou veículo seminovo.');
  }

  if (descLower.includes('garantia') || descLower.includes('garantia de fábrica')) {
    positivePoints.push('Garantia de fábrica ativa ou estendida mencionada.');
  }

  if (descLower.includes('ipva') || descLower.includes('quitado') || descLower.includes('sem débitos')) {
    positivePoints.push('Documentação/IPVA informado como regularizado.');
  }

  // Baseline positive if features are complete
  if (ad.features.length >= 5 && !positivePoints.includes('Equipamentos e opcionais bem detalhados.')) {
    positivePoints.push('Amplo pacote de equipamentos e opcionais descritos.');
  }

  // --- Attention points detection (using safe, transparent language) ---
  if (!descLower.includes('revisõ') && !descLower.includes('revisao') && !descLower.includes('concessionária')) {
    attentionPoints.push('Ponto de atenção: O anúncio não informa histórico recente de revisões ou manutenções.');
  }

  if (!descLower.includes('manual') && !descLower.includes('chave reserva')) {
    attentionPoints.push('Ponto de atenção: O texto do anúncio não menciona se acompanha manual e chave reserva.');
  }

  if (!descLower.includes('laudo') && !descLower.includes('cautelar') && !descLower.includes('periciado')) {
    attentionPoints.push('Não foi possível verificar status de laudo cautelar no texto disponibilizado.');
  }

  if (ad.description.length < 120) {
    attentionPoints.push('Ponto de atenção: Descrição do anúncio bastante resumida. Recomendamos solicitar detalhes ao vendedor.');
  }

  const expectedKmPerYear = 15000;
  const carAge = Math.max(1, 2026 - ad.year);
  if (ad.mileage > carAge * 20000) {
    attentionPoints.push('Ponto de atenção: Quilometragem acima da média anual estimada para o ano do veículo.');
  }

  // --- Sub-scores calculation (0 to 10) ---
  // 1. Price Score
  let priceScore = 7.5;
  if (priceAnalysis.differencePercent <= -7) priceScore = 9.8;
  else if (priceAnalysis.differencePercent <= -3) priceScore = 9.1;
  else if (priceAnalysis.differencePercent <= 1) priceScore = 8.2;
  else if (priceAnalysis.differencePercent <= 5) priceScore = 7.0;
  else priceScore = 5.5;

  // 2. Mileage Score
  const currentRatio = ad.mileage / (carAge * expectedKmPerYear);
  let mileageScore = 8.5;
  if (currentRatio < 0.6) mileageScore = 9.7;
  else if (currentRatio < 0.9) mileageScore = 9.0;
  else if (currentRatio <= 1.2) mileageScore = 8.0;
  else mileageScore = 6.5;

  // 3. Year Score
  let yearScore = 9.0;
  if (ad.year >= 2024) yearScore = 9.8;
  else if (ad.year >= 2022) yearScore = 9.2;
  else if (ad.year >= 2020) yearScore = 8.4;
  else yearScore = 7.5;

  // 4. Features Score
  let featuresScore = Math.min(9.8, 6.0 + (ad.features.length * 0.45));

  // 5. Description Quality Score
  let descQualityScore = 6.0;
  if (ad.description.length > 250) descQualityScore += 2.0;
  else if (ad.description.length > 120) descQualityScore += 1.0;
  if (positivePoints.length >= 3) descQualityScore += 1.5;

  descQualityScore = Math.min(9.6, Math.max(4.0, descQualityScore));

  // 6. Cost-Benefit Score
  let costBenefit = (priceScore * 0.4) + (mileageScore * 0.25) + (featuresScore * 0.2) + (yearScore * 0.15);
  costBenefit = Math.min(9.9, Math.max(5.0, Number(costBenefit.toFixed(1))));

  // Total Overall Score
  const totalScore = Number(
    ((priceScore * 0.3) + (costBenefit * 0.3) + (mileageScore * 0.15) + (featuresScore * 0.15) + (descQualityScore * 0.1)).toFixed(1)
  );

  return {
    totalScore,
    breakdown: {
      price: Number(priceScore.toFixed(1)),
      mileage: Number(mileageScore.toFixed(1)),
      year: Number(yearScore.toFixed(1)),
      features: Number(featuresScore.toFixed(1)),
      descriptionQuality: Number(descQualityScore.toFixed(1)),
      costBenefit: Number(costBenefit.toFixed(1)),
    },
    positivePoints,
    attentionPoints,
  };
}
