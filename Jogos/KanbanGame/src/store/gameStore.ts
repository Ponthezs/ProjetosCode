import { create } from 'zustand';
import { applyAction, canMoveCard, type MoveCheck } from '../game-engine/actions';
import { createGame, type NewGameConfig } from '../game-engine/generator';
import { SCENARIO_MAP } from '../scenarios';
import { ACHIEVEMENT_MAP } from '../data/achievements';
import { DIFFICULTIES } from '../data/difficulties';
import { GameRepository } from '../services/storage';
import { configureSound, play } from '../services/sound';
import type { AppSettings, DayResult, FloatFx, GameAction, GameState, Profile, RankingEntry, StageId } from '../types';

export type Screen = 'menu' | 'newgame' | 'game' | 'end' | 'ranking' | 'howto' | 'settings';
export type GameView = 'board' | 'team' | 'analytics' | 'office' | 'upgrades' | 'achievements' | 'log';

export interface Toast {
  id: number;
  tone: 'good' | 'bad' | 'warn' | 'info';
  title: string;
  body?: string;
  icon?: string;
}

interface Store {
  ready: boolean;
  screen: Screen;
  newGameTab: 'campaign' | 'modes';
  settings: AppSettings;
  profile: Profile;
  ranking: RankingEntry[];
  game: GameState | null;
  hasSave: boolean;
  view: GameView;
  selectedCardId: string | null;
  hoverCardId: string | null;
  animating: boolean;
  fx: FloatFx[];
  fxKey: number;
  celebrations: DayResult['deliveries'];
  briefingOpen: boolean;
  rightPanel: boolean;
  toasts: Toast[];
  tutorialStep: number;
  talentOpen: boolean;

  init: () => Promise<void>;
  setScreen: (s: Screen, tab?: 'campaign' | 'modes') => void;
  setView: (v: GameView) => void;
  newGame: (cfg: NewGameConfig) => void;
  continueGame: () => void;
  abandonGame: () => void;
  dispatch: (a: GameAction) => void;
  tryMove: (cardId: string, to: StageId, index?: number) => MoveCheck;
  startDay: () => void;
  selectCard: (id: string | null) => void;
  setHoverCard: (id: string | null) => void;
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  updateSettings: (p: Partial<AppSettings>) => void;
  setBriefing: (v: boolean) => void;
  setRightPanel: (v: boolean) => void;
  shiftCelebration: () => void;
  setTutorialStep: (n: number) => void;
  setTalentOpen: (v: boolean) => void;
}

let toastSeq = 0;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(g: GameState | null) {
  if (!g) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void GameRepository.saveGame(g), 250);
}

export const DAY_ANIMATION_MS: Record<AppSettings['animationSpeed'], number> = { slow: 2600, normal: 1700, fast: 900 };

export const useGame = create<Store>((set, get) => ({
  ready: false,
  screen: 'menu',
  newGameTab: 'campaign',
  settings: { theme: 'dark', sound: true, volume: 0.5, animationSpeed: 'normal', reducedEffects: false },
  profile: { achievements: [], completedScenarios: {}, gamesPlayed: 0, tutorialDone: false },
  ranking: [],
  game: null,
  hasSave: false,
  view: 'board',
  selectedCardId: null,
  hoverCardId: null,
  animating: false,
  fx: [],
  fxKey: 0,
  celebrations: [],
  briefingOpen: false,
  rightPanel: true,
  toasts: [],
  tutorialStep: 0,
  talentOpen: false,

  init: async () => {
    const [settings, profile, ranking, save] = await Promise.all([
      GameRepository.loadSettings(), GameRepository.loadProfile(), GameRepository.loadRanking(), GameRepository.loadGame(),
    ]);
    configureSound(settings.sound, settings.volume);
    const valid = save && save.version >= 3 && save.phase === 'planning' ? save : null;
    set({ settings, profile, ranking, game: valid, hasSave: !!valid, ready: true, rightPanel: typeof window !== 'undefined' ? window.innerWidth >= 1280 : true });
  },

  setScreen: (screen, tab) => set({ screen, ...(tab ? { newGameTab: tab } : {}) }),
  setView: (view) => set({ view }),

  newGame: (cfg) => {
    const g = createGame(cfg);
    const profile = { ...get().profile, gamesPlayed: get().profile.gamesPlayed + 1 };
    void GameRepository.saveProfile(profile);
    set({ game: g, hasSave: true, screen: 'game', view: 'board', selectedCardId: null, fx: [], celebrations: [], briefingOpen: !cfg.tutorial, profile, tutorialStep: 0 });
    scheduleSave(g);
    play('day');
  },

  continueGame: () => {
    const g = get().game;
    if (!g) return;
    set({ screen: g.phase === 'ended' ? 'end' : 'game', view: 'board', briefingOpen: false });
  },

  abandonGame: () => {
    void GameRepository.clearGame();
    set({ game: null, hasSave: false, screen: 'menu' });
  },

  dispatch: (a) => {
    const g = get().game;
    if (!g) return;
    const next = applyAction(g, a);
    set({ game: next });
    scheduleSave(next);
    if (next.newAchievements.length) handleAchievements(next, set, get);
  },

  tryMove: (cardId, to, index) => {
    const g = get().game;
    if (!g) return { ok: false, reason: 'Sem partida' };
    const chk = canMoveCard(g, cardId, to);
    if (!chk.ok) {
      play('error');
      get().toast({ tone: 'bad', title: 'Movimento não permitido', body: chk.reason, icon: '⛔' });
      return chk;
    }
    get().dispatch({ type: 'moveCard', cardId, to, index });
    play('drop');
    if (chk.warning) get().toast({ tone: 'warn', title: 'WIP EXCEDIDO', body: chk.warning, icon: '⚠️' });
    return chk;
  },

  startDay: () => {
    const { game: g, animating, settings } = get();
    if (!g || animating || g.phase !== 'planning') return;
    const blocking = g.pendingEvents.filter((e) => !e.autoApplied && e.choices?.length);
    if (blocking.length) {
      get().toast({ tone: 'warn', title: 'Decisão pendente', body: 'Resolva os eventos antes de iniciar o dia.', icon: '📋' });
      return;
    }
    play('day');
    const next = applyAction(g, { type: 'processDay' });
    const res = next.lastResult;
    set({ game: next, animating: true, fx: res?.fx ?? [], fxKey: get().fxKey + 1, celebrations: res?.deliveries ?? [], briefingOpen: false, selectedCardId: null });
    scheduleSave(next);
    if (res) {
      if (res.deliveries.length) setTimeout(() => { play('deploy'); setTimeout(() => play('done'), 350); setTimeout(() => play('money'), 700); }, 500);
      if (res.bugsFound) setTimeout(() => play('bug'), 300);
    }
    const dur = settings.reducedEffects ? 400 : DAY_ANIMATION_MS[settings.animationSpeed];
    setTimeout(() => {
      const cur = get().game;
      if (!cur) return;
      if (cur.phase === 'ended') {
        finishGame(cur, set, get);
        return;
      }
      if (cur.pendingEvents.some((e) => e.severity === 'critical')) play('alert');
      else if (cur.pendingEvents.length) play('event');
      set({ animating: false, fx: [], briefingOpen: true });
      if (cur.newAchievements.length) handleAchievements(cur, set, get);
    }, dur);
  },

  selectCard: (id) => set({ selectedCardId: id }),
  setHoverCard: (id) => set({ hoverCardId: id }),

  toast: (t) => {
    const id = ++toastSeq;
    set({ toasts: [...get().toasts.slice(-4), { ...t, id }] });
    setTimeout(() => get().dismissToast(id), t.tone === 'bad' ? 4200 : 3400);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  updateSettings: (p) => {
    const settings = { ...get().settings, ...p };
    configureSound(settings.sound, settings.volume);
    void GameRepository.saveSettings(settings);
    set({ settings });
  },
  setBriefing: (v) => set({ briefingOpen: v }),
  setRightPanel: (v) => set({ rightPanel: v }),
  shiftCelebration: () => set({ celebrations: get().celebrations.slice(1) }),
  setTutorialStep: (n) => set({ tutorialStep: n }),
  setTalentOpen: (v) => set({ talentOpen: v }),
}));

type SetFn = (p: Partial<Store>) => void;
type GetFn = () => Store;

function handleAchievements(g: GameState, set: SetFn, get: GetFn) {
  const ids = g.newAchievements;
  const profile = { ...get().profile, achievements: [...new Set([...get().profile.achievements, ...ids])] };
  void GameRepository.saveProfile(profile);
  set({ profile });
  {
    ids.forEach((id, i) => {
      const a = ACHIEVEMENT_MAP[id];
      if (!a) return;
      setTimeout(() => {
        play('achievement');
        get().toast({ tone: 'good', title: `🏆 ${a.name}`, body: a.description, icon: a.icon });
      }, 400 + i * 900);
    });
  }
  const next = applyAction(g, { type: 'clearNewAchievements' });
  set({ game: next });
  scheduleSave(next);
}

function finishGame(g: GameState, set: SetFn, get: GetFn) {
  const r = g.report;
  const entry: RankingEntry = {
    id: g.id, score: r?.score ?? 0, rankName: r?.rank.name ?? '', scenario: SCENARIO_MAP[g.scenarioId]?.name ?? g.scenarioId,
    difficulty: DIFFICULTIES.find((d) => d.id === g.difficultyId)?.name ?? g.difficultyId, mode: g.mode, days: g.totalDays,
    seedLabel: g.seedLabel, date: Date.now(), profit: r?.metrics.profit ?? 0, leadTime: r?.metrics.leadTime ?? 0, throughput: r?.metrics.throughput ?? 0,
  };
  const profile = { ...get().profile, tutorialDone: true };
  if (g.mode === 'campaign' && r) profile.completedScenarios = { ...profile.completedScenarios, [g.scenarioId]: Math.max(profile.completedScenarios[g.scenarioId] ?? 0, r.stars) };
  profile.achievements = [...new Set([...profile.achievements, ...g.achievements])];
  void GameRepository.saveProfile(profile);
  void GameRepository.addRanking(entry).then((ranking) => set({ ranking }));
  void GameRepository.clearGame();
  play('achievement');
  set({ animating: false, fx: [], screen: 'end', profile, hasSave: false });
}
