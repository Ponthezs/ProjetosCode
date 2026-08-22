export type CarSource = 'Webmotors' | 'OLX' | 'iCarros' | 'AutoLine';
export type FuelType = 'Flex' | 'Gasolina' | 'Diesel' | 'Híbrido' | 'Elétrico';
export type TransmissionType = 'Automático' | 'Manual' | 'CVT' | 'Automatizado';
export type BodyType = 'Sedan' | 'Hatch' | 'SUV' | 'Pickup' | 'Coupe' | 'Perua' | 'Minivan';
export type SellerType = 'Particular' | 'Loja';
export type PriceStatus = 'excellent' | 'good' | 'average' | 'high';

export interface CarAd {
  id: string;
  source: CarSource;
  sourceUrl: string;
  title: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  modelYear: number;
  mileage: number;
  price: number;
  location: {
    city: string;
    state: string;
  };
  seller: {
    name: string;
    type: SellerType;
    verified?: boolean;
  };
  images: string[];
  description: string;
  fuel: FuelType;
  transmission: TransmissionType;
  engine: string; // e.g. "2.0 Flex 16V"
  power: string;  // e.g. "177 cv"
  bodyType: BodyType;
  color: string;
  doors: number;
  features: string[];
  publishedAt: string;
  updatedAt: string;
}

export interface PriceAnalysis {
  status: PriceStatus;
  statusLabel: string;
  marketAverage: number;
  difference: number; // e.g. -4600 (below) or +2000 (above)
  differencePercent: number; // e.g. -3.7%
  minMarketPrice: number;
  maxMarketPrice: number;
  percentileRank: number; // 0 to 100 position in spectrum
}

export interface AIScoreBreakdown {
  price: number;            // 0-10
  mileage: number;          // 0-10
  year: number;             // 0-10
  features: number;         // 0-10
  descriptionQuality: number;// 0-10
  costBenefit: number;      // 0-10
}

export interface AIScore {
  totalScore: number;       // 0-10, e.g. 8.8
  breakdown: AIScoreBreakdown;
  positivePoints: string[];
  attentionPoints: string[];
}

export interface DealOpportunity {
  dealScore: number;       // 0-100 opportunity index
  savingsAmount: number;   // discount in R$
  savingsPercent: number;
  isHotDeal: boolean;
}

export interface FilterState {
  search: string;
  brand: string;
  model: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  transmission?: string;
  fuel?: string;
  bodyType?: string;
  sellerType?: string;
  sortBy: 'cost_benefit' | 'price_asc' | 'price_desc' | 'discount_desc' | 'year_desc' | 'mileage_asc' | 'score_desc';
}

export interface FavoriteItem {
  carId: string;
  addedAt: string;
  initialPrice: number;
  currentPrice: number;
}

export interface AlertItem {
  id: string;
  title: string;
  query: string;
  brand?: string;
  model?: string;
  maxPrice?: number;
  maxMileage?: number;
  minYear?: number;
  location?: string;
  createdAt: string;
  active: boolean;
  matchedCount: number;
}

export interface PriceHistoryPoint {
  date: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}
