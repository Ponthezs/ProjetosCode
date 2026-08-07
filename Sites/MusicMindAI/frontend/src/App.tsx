import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PlayerBar } from './components/layout/PlayerBar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { AIOrganizerView } from './views/AIOrganizerView';
import { PlaylistsView } from './views/PlaylistsView';
import { DuplicatesView } from './views/DuplicatesView';
import { RecommendationsView } from './views/RecommendationsView';
import { BackupHistoryView } from './views/BackupHistoryView';
import { ListeningModesView } from './views/ListeningModesView';
import { SettingsView } from './views/SettingsView';
import { fetchAuthStatus } from './services/api';
import { Track } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [userEmail, setUserEmail] = useState('musico.ai@gmail.com');
  const [isConnected, setIsConnected] = useState(true);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [activeModeTitle, setActiveModeTitle] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthStatus()
      .then(res => {
        setIsConnected(res.is_connected);
        setUserEmail(res.user_email);
      })
      .catch(e => console.error(e));
  }, []);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setIsConnected(true);
    setCurrentTab('dashboard');
  };

  const handleLaunchMode = (modeTitle: string, tracks: Track[]) => {
    setActiveModeTitle(modeTitle);
    if (tracks && tracks.length > 0) {
      setActiveTrack(tracks[0]);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-obsidian-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userEmail={userEmail}
        isConnected={isConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOrganizeClick={() => setCurrentTab('ai-organizer')}
          onExportClick={() => setCurrentTab('backup-history')}
        />

        {/* View Container */}
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-obsidian-900 via-obsidian-900 to-obsidian-800">
          {currentTab === 'login' && <LoginView onSuccess={handleLoginSuccess} />}
          {currentTab === 'dashboard' && <DashboardView onNavigateTab={setCurrentTab} />}
          {currentTab === 'ai-organizer' && <AIOrganizerView />}
          {currentTab === 'playlists' && <PlaylistsView />}
          {currentTab === 'duplicates' && <DuplicatesView />}
          {currentTab === 'recommendations' && <RecommendationsView />}
          {currentTab === 'modes' && <ListeningModesView onLaunchMode={handleLaunchMode} />}
          {currentTab === 'backup-history' && <BackupHistoryView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>

        {/* Spotify Desktop Style Player Bar */}
        <PlayerBar
          currentTrack={activeTrack}
          activeModeTitle={activeModeTitle}
        />
      </div>
    </div>
  );
}

export default App;
