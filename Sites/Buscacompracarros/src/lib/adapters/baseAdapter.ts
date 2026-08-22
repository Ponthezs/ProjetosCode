import { CarAd, FilterState } from '../types';

export interface CarAdapter {
  sourceName: string;
  search(filters: Partial<FilterState>): Promise<CarAd[]>;
}
