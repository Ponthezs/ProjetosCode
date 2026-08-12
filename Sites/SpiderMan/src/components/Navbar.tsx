import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Shield, Globe, Compass, Sliders, Zap } from 'lucide-react';
import { soundEngine } from '../services/audioService';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = soundEngine.subscribe((muted) => setIsMuted(muted));
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSoundToggle = () => {
    soundEngine.toggleMute();
  };

  const navItems = [
    { id: 'suits-section', label: 'SUITS', icon: Shield },
    { id: 'timeline-section', label: 'EVOLUTION', icon: Compass },
    { id: 'multiverse-section', label: 'MULTIVERSE', icon: Globe },
    { id: 'swing-section', label: 'CITY SWING', icon: Zap },
    { id: 'compare-section', label: 'COMPARE', icon: Sliders },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07080C]/85 backdrop-blur-md border-b border-red-500/20 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
          : 'bg-gradient-to-b from-[#07080C]/90 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Spider Logo */}
        <button
          onClick={() => onNavigate('hero-section')}
          className="flex items-center space-x-3 group text-left cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 group-hover:border-red-500 group-hover:shadow-[0_0_15px_rgba(229,9,20,0.6)] transition-all">
            <svg
              className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* Custom Spider Vector Icon */}
              <path d="M12 2C10.5 2 9 3.5 9 5c0 1.2.7 2.2 1.7 2.7-.4 1-1.3 2-2.7 2.3C6 10.3 4 8.5 4 7c0-.6-.4-1-1-1s-1 .4-1 1c0 2.5 2.5 5 5.5 5.5.3 1.2.8 2.5 1.5 3.5-2 .5-4.5 2-4.5 4.5 0 .6.4 1 1 1s1-.4 1-1c0-1.5 1.8-2.6 3.5-3 1 1.2 2.2 2 3.5 2s2.5-.8 3.5-2c1.7.4 3.5 1.5 3.5 3 0 .6.4 1 1 1s1-.4 1-1c0-2.5-2.5-4-4.5-4.5.7-1 1.2-2.3 1.5-3.5 3-.5 5.5-3 5.5-5.5 0-.6-.4-1-1-1s-1 .4-1 1c0 1.5-2 3.3-4 3c-1.4-.3-2.3-1.3-2.7-2.3C14.3 7.2 15 6.2 15 5c0-1.5-1.5-3-3-3zm0 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z" />
            </svg>
          </div>
          <div>
            <span className="block font-extrabold text-sm sm:text-base tracking-widest text-white uppercase font-sans">
              SPIDER-MAN
            </span>
            <span className="block text-[10px] tracking-widest text-red-500 font-mono uppercase">
              SUIT EVOLUTION
            </span>
          </div>
        </button>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate(item.id);
                }}
                className={`relative px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'text-white bg-red-600/30 border border-red-500/60 shadow-[0_0_12px_rgba(229,9,20,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-500' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-red-500 shadow-[0_0_8px_#E50914]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sound Toggle Button */}
        <button
          onClick={handleSoundToggle}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer border ${
            !isMuted
              ? 'border-red-500/50 bg-red-950/40 text-red-400 shadow-[0_0_15px_rgba(229,9,20,0.3)]'
              : 'border-gray-700 bg-gray-900/60 text-gray-400 hover:border-gray-500'
          }`}
          title="Toggle Ambient Audio & Sound FX"
        >
          {!isMuted ? (
            <>
              <Volume2 className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="hidden sm:inline">SOUND ON</span>
              <div className="flex items-center space-x-0.5 h-3">
                <span className="w-0.5 h-full bg-red-500 animate-pulse" />
                <span className="w-0.5 h-2/3 bg-red-400 animate-pulse delay-75" />
                <span className="w-0.5 h-4/5 bg-red-500 animate-pulse delay-150" />
              </div>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-gray-400" />
              <span className="hidden sm:inline">SOUND OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile nav bottom bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-white/5 bg-[#07080C]/95">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundEngine.playClick();
                onNavigate(item.id);
              }}
              className={`p-2 rounded-md flex flex-col items-center text-[10px] ${
                isActive ? 'text-red-500 font-bold' : 'text-gray-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
