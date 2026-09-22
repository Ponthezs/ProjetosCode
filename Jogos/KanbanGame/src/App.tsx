import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Toasts } from './components/effects/Toasts';
import { EndScreen } from './pages/EndScreen';
import { GameScreen } from './pages/GameScreen';
import { HowToPlay } from './pages/HowToPlay';
import { MainMenu } from './pages/MainMenu';
import { NewGame } from './pages/NewGame';
import { RankingPage } from './pages/RankingPage';
import { SettingsPage } from './pages/SettingsPage';
import { useGame } from './store/gameStore';

export default function App() {
  const { ready, screen, settings, init } = useGame();

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', settings.theme === 'light');
    root.classList.toggle('dark', settings.theme === 'dark');
    root.classList.toggle('reduce-motion', settings.reducedEffects);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.theme === 'light' ? '#eef1f8' : '#06080e');
  }, [settings.theme, settings.reducedEffects]);

  if (!ready) {
    return (
      <div className="app-bg flex h-full items-center justify-center">
        <div className="text-gradient font-display text-2xl font-bold tracking-[0.3em]">FLOW OPS</div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion={settings.reducedEffects ? 'always' : 'user'}>
      <div className="app-bg h-full w-full text-fg">
        <AnimatePresence mode="wait">
          <motion.div key={screen} className="h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {screen === 'menu' && <MainMenu />}
            {screen === 'newgame' && <NewGame />}
            {screen === 'game' && <GameScreen />}
            {screen === 'end' && <EndScreen />}
            {screen === 'ranking' && <RankingPage />}
            {screen === 'howto' && <HowToPlay />}
            {screen === 'settings' && <SettingsPage />}
          </motion.div>
        </AnimatePresence>
        <Toasts />
      </div>
    </MotionConfig>
  );
}
