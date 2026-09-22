/* ============================================================
 * Persistência — padrão Adapter.
 * Hoje: LocalStorage. Para conectar Supabase / PostgreSQL / Firebase,
 * implemente StorageAdapter (métodos assíncronos) e troque em
 * `setStorageAdapter()`. O resto do jogo não muda.
 * ============================================================ */
import type { AppSettings, GameState, Profile, RankingEntry } from '../types';

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private prefix = 'flowops:') {}
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) {
      console.warn('[FLOW OPS] Falha ao salvar', e);
    }
  }
  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch {
      /* ignora */
    }
  }
}

/** Exemplo de adapter remoto (esqueleto para Supabase/Firebase) */
export class RemoteAdapterExample implements StorageAdapter {
  constructor(private baseUrl: string, private token: string) {}
  async get<T>(key: string): Promise<T | null> {
    const r = await fetch(`${this.baseUrl}/kv/${key}`, { headers: { Authorization: `Bearer ${this.token}` } });
    return r.ok ? ((await r.json()) as T) : null;
  }
  async set<T>(key: string, value: T): Promise<void> {
    await fetch(`${this.baseUrl}/kv/${key}`, { method: 'PUT', headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
  }
  async remove(key: string): Promise<void> {
    await fetch(`${this.baseUrl}/kv/${key}`, { method: 'DELETE', headers: { Authorization: `Bearer ${this.token}` } });
  }
}

let adapter: StorageAdapter = new LocalStorageAdapter();
export function setStorageAdapter(a: StorageAdapter) {
  adapter = a;
}

const KEYS = { save: 'save:current', ranking: 'ranking', profile: 'profile', settings: 'settings' };

export const GameRepository = {
  loadGame: () => adapter.get<GameState>(KEYS.save),
  saveGame: (g: GameState) => adapter.set(KEYS.save, g),
  clearGame: () => adapter.remove(KEYS.save),
  loadRanking: async () => (await adapter.get<RankingEntry[]>(KEYS.ranking)) ?? [],
  addRanking: async (e: RankingEntry) => {
    const list = (await adapter.get<RankingEntry[]>(KEYS.ranking)) ?? [];
    const next = [...list.filter((x) => x.id !== e.id), e].sort((a, b) => b.score - a.score).slice(0, 50);
    await adapter.set(KEYS.ranking, next);
    return next;
  },
  loadProfile: async (): Promise<Profile> => (await adapter.get<Profile>(KEYS.profile)) ?? { achievements: [], completedScenarios: {}, gamesPlayed: 0, tutorialDone: false },
  saveProfile: (p: Profile) => adapter.set(KEYS.profile, p),
  loadSettings: async (): Promise<AppSettings> => ({ theme: 'dark', sound: true, volume: 0.5, animationSpeed: 'normal', reducedEffects: false, ...((await adapter.get<AppSettings>(KEYS.settings)) ?? {}) }),
  saveSettings: (s: AppSettings) => adapter.set(KEYS.settings, s),
};
