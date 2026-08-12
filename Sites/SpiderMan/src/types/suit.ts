export interface SuitHotspot {
  id: string;
  label: string;
  title: string;
  description: string;
  x: number; // percentage X on suit viewer (0-100)
  y: number; // percentage Y on suit viewer (0-100)
  category: 'lens' | 'emblem' | 'shooter' | 'armor' | 'tech';
}

export interface SuitStats {
  defense: number; // 0 - 100
  speed: number;   // 0 - 100
  tech: number;    // 0 - 100
  agility: number; // 0 - 100
  stealth: number; // 0 - 100
}

export type SuitCategory = 
  | 'ALL'
  | 'CLASSICS'
  | 'TECHNOLOGY'
  | 'SYMBIOTE'
  | 'MULTIVERSE'
  | 'STEALTH'
  | 'MILES'
  | 'PETER'
  | 'LIVE-ACTION'
  | 'ANIMATION';

export interface Suit {
  id: string;
  number: string; // e.g. "01"
  name: string;
  tagline: string;
  year: string;
  period: string;
  version: string;
  universe: string;
  origin: string;
  description: string;
  characteristics: string[];
  abilities: string[];
  technology: string[];
  trivia: string[];
  categories: SuitCategory[];
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  badgeText: string;
  stats: SuitStats;
  hotspots: SuitHotspot[];
  suitType: 'classic' | 'symbiote' | 'iron' | 'advanced' | 'stealth' | '2099' | 'miles' | 'punk' | 'india' | 'noir' | 'negative' | 'homemade';
  imageUrl?: string;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  era: string;
  description: string;
  suitId: string;
  highlightSuitName: string;
  keyEvents: string[];
  color: string;
}

export interface MultiversePortal {
  id: string;
  heroName: string;
  alterEgo: string;
  universe: string;
  earthCode: string;
  tagline: string;
  quote: string;
  description: string;
  suitId: string;
  primaryColor: string;
  accentColor: string;
  portalParticleColor: string;
  traits: string[];
  signatureWeapon: string;
}

export interface ComicPop {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}
