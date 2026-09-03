export interface MovieItem {
  id: string;
  title: string;
  year: string;
  era: 'tobey' | 'andrew' | 'tom' | 'spiderverse' | 'classic77';
  eraName: string;
  director?: string;
  actors: string[];
  villains: string[];
  summary: string;
  highlights: string[];
  youtubeTrailerId: string;
  youtubeUrl: string;
  posterBadge: string;
}

export interface GameItem {
  id: string;
  title: string;
  year: string;
  platform: string;
  era: '80s' | '90s' | 'neversoft' | 'movie_era' | 'multiverse' | 'insomniac';
  eraName: string;
  developer?: string;
  summary: string;
  keyInnovations: string[];
  isEssential: boolean;
  youtubeTrailerId?: string;
  youtubeUrl?: string;
}

export interface MovieTimelineEra {
  eraId: string;
  eraName: string;
  badge: string;
  years: string;
  movies: {
    year: string;
    title: string;
    note?: string;
  }[];
  color: string;
}
