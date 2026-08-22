import { CarAd, FilterState } from '../types';
import { mockCarAds } from '../data/mockCars';
import { analyzeCarPrice, calculateDealOpportunity } from '../engine/priceAnalyzer';
import { evaluateCarAd } from '../engine/aiEvaluator';

export class CarAggregator {
  /**
   * Search car ads across integrated sources, filter, deduplicate and sort
   */
  public async searchAds(filters: FilterState): Promise<CarAd[]> {
    // 1. Fetch from mock source registry
    let results = [...mockCarAds];

    // 2. Query filter matching
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      
      // Parse natural language hints like "até R$ 130.000", "2022"
      const priceMatch = q.match(/até r\$\s*(\d+[\d.]*)/i) || q.match(/até\s*(\d+)\s*mil/i);
      let parsedMaxPrice: number | undefined = undefined;
      if (priceMatch) {
        let valStr = priceMatch[1].replace(/\./g, '');
        let rawVal = parseInt(valStr, 10);
        if (rawVal < 1000) rawVal *= 1000;
        parsedMaxPrice = rawVal;
      }

      const yearMatch = q.match(/\b(201\d|202\d)\b/);
      let parsedYear: number | undefined = undefined;
      if (yearMatch) {
        parsedYear = parseInt(yearMatch[1], 10);
      }

      results = results.filter(car => {
        const textToSearch = `${car.brand} ${car.model} ${car.version} ${car.description} ${car.location.city} ${car.location.state} ${car.engine} ${car.bodyType}`.toLowerCase();
        
        // Remove specific numbers extracted for special checks to allow model match
        const cleanedQ = q.replace(/até r\$\s*[\d.]+/gi, '').replace(/até\s*\d+\s*mil/gi, '').trim();
        
        let matchesText = true;
        if (cleanedQ.length > 0) {
          const terms = cleanedQ.split(' ').filter(t => t.length > 1);
          matchesText = terms.every(term => textToSearch.includes(term));
        }

        let matchesParsedPrice = true;
        if (parsedMaxPrice) {
          matchesParsedPrice = car.price <= parsedMaxPrice;
        }

        let matchesParsedYear = true;
        if (parsedYear) {
          matchesParsedYear = car.year === parsedYear || car.modelYear === parsedYear;
        }

        return matchesText && matchesParsedPrice && matchesParsedYear;
      });
    }

    // 3. Structured Filters
    if (filters.brand) {
      results = results.filter(c => c.brand.toLowerCase() === filters.brand.toLowerCase());
    }
    if (filters.model) {
      results = results.filter(c => c.model.toLowerCase() === filters.model.toLowerCase());
    }
    if (filters.minPrice) {
      results = results.filter(c => c.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      results = results.filter(c => c.price <= filters.maxPrice!);
    }
    if (filters.minYear) {
      results = results.filter(c => c.year >= filters.minYear!);
    }
    if (filters.maxYear) {
      results = results.filter(c => c.year <= filters.maxYear!);
    }
    if (filters.maxMileage) {
      results = results.filter(c => c.mileage <= filters.maxMileage!);
    }
    if (filters.transmission) {
      results = results.filter(c => c.transmission.toLowerCase() === filters.transmission!.toLowerCase());
    }
    if (filters.fuel) {
      results = results.filter(c => c.fuel.toLowerCase() === filters.fuel!.toLowerCase());
    }
    if (filters.bodyType) {
      results = results.filter(c => c.bodyType.toLowerCase() === filters.bodyType!.toLowerCase());
    }
    if (filters.sellerType) {
      results = results.filter(c => c.seller.type.toLowerCase() === filters.sellerType!.toLowerCase());
    }

    // 4. Deduplication Engine (collapses duplicate cars posted on multiple sites)
    results = this.deduplicateAds(results);

    // 5. Sort Engine
    results = this.sortAds(results, filters.sortBy);

    return results;
  }

  /**
   * Identifies ads with matching brand, model, version, year, mileage within ±500km and price within ±2%
   */
  private deduplicateAds(ads: CarAd[]): CarAd[] {
    const uniqueAds: CarAd[] = [];
    
    for (const ad of ads) {
      const isDuplicate = uniqueAds.some(existing => {
        const sameModel = existing.brand.toLowerCase() === ad.brand.toLowerCase() &&
                          existing.model.toLowerCase() === ad.model.toLowerCase();
        const sameYear = existing.year === ad.year;
        const closeMileage = Math.abs(existing.mileage - ad.mileage) <= 500;
        const closePrice = Math.abs(existing.price - ad.price) <= existing.price * 0.02;

        return sameModel && sameYear && closeMileage && closePrice;
      });

      if (!isDuplicate) {
        uniqueAds.push(ad);
      }
    }

    return uniqueAds;
  }

  /**
   * Sorts listings based on requested criterion
   */
  private sortAds(ads: CarAd[], sortBy: FilterState['sortBy']): CarAd[] {
    const sorted = [...ads];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'year_desc':
        return sorted.sort((a, b) => b.year - a.year);
      case 'mileage_asc':
        return sorted.sort((a, b) => a.mileage - b.mileage);
      case 'discount_desc':
        return sorted.sort((a, b) => {
          const pA = analyzeCarPrice(a, mockCarAds);
          const pB = analyzeCarPrice(b, mockCarAds);
          return pA.difference - pB.difference; // most negative difference first
        });
      case 'score_desc':
        return sorted.sort((a, b) => {
          const pA = analyzeCarPrice(a, mockCarAds);
          const pB = analyzeCarPrice(b, mockCarAds);
          const sA = evaluateCarAd(a, pA).totalScore;
          const sB = evaluateCarAd(b, pB).totalScore;
          return sB - sA;
        });
      case 'cost_benefit':
      default:
        return sorted.sort((a, b) => {
          const pA = analyzeCarPrice(a, mockCarAds);
          const pB = analyzeCarPrice(b, mockCarAds);
          const dA = calculateDealOpportunity(a, pA).dealScore;
          const dB = calculateDealOpportunity(b, pB).dealScore;
          return dB - dA;
        });
    }
  }
}

export const aggregator = new CarAggregator();
