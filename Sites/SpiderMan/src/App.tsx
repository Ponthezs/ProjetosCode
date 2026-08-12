import { useState, useEffect } from 'react';
import { CustomCursor } from './components/CustomCursor';
import { ComicFXOverlay } from './components/ComicFXOverlay';
import { Navbar } from './components/Navbar';
import { HeroIntro } from './components/HeroIntro';
import { SuitGallery } from './components/SuitGallery';
import { SuitInspector } from './components/SuitInspector';
import { Timeline } from './components/Timeline';
import { MultiversePortals } from './components/MultiversePortals';
import { CitySwingScene } from './components/CitySwingScene';
import { SuitCompare } from './components/SuitCompare';
import { FooterFinale } from './components/FooterFinale';
import type { Suit } from './types/suit';
import { SUITS_DATA } from './data/suitsData';

export function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [activeSection, setActiveSection] = useState('hero-section');
  const [inspectedSuit, setInspectedSuit] = useState<Suit | null>(null);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSuitById = (suitId: string) => {
    const found = SUITS_DATA.find((s) => s.id === suitId);
    if (found) {
      setInspectedSuit(found);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = ['hero-section', 'suits-section', 'timeline-section', 'multiverse-section', 'swing-section', 'compare-section'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [hasEntered]);

  return (
    <div className="min-h-screen bg-[#07080C] text-white selection:bg-red-600 selection:text-white font-sans relative overflow-x-hidden">
      {/* Target Reticle Cursor */}
      <CustomCursor />

      {/* Comic Action Sound Effects Popups */}
      <ComicFXOverlay />

      {!hasEntered ? (
        <HeroIntro
          onEnter={() => {
            setHasEntered(true);
            setTimeout(() => {
              handleNavigate('suits-section');
            }, 300);
          }}
        />
      ) : (
        <>
          {/* Fixed Minimalist Navbar */}
          <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

          {/* Hero Section Container */}
          <HeroIntro onEnter={() => handleNavigate('suits-section')} />

          {/* Main Experience Content Sections */}
          <main className="relative z-10 space-y-16 sm:space-y-24">
            <SuitGallery onInspectSuit={(suit) => setInspectedSuit(suit)} />
            <Timeline onSelectSuit={handleSelectSuitById} />
            <MultiversePortals onSelectSuit={handleSelectSuitById} />
            <CitySwingScene />
            <SuitCompare />
          </main>

          {/* Grand Finale Footer */}
          <FooterFinale
            onRestart={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setHasEntered(false);
            }}
          />

          {/* 360° Suit Inspector Modal */}
          {inspectedSuit && (
            <SuitInspector
              suit={inspectedSuit}
              onClose={() => setInspectedSuit(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
