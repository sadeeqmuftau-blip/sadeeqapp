import React from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellRing, 
  Smartphone, 
  SlidersHorizontal, 
  Activity, 
  Wifi, 
  WifiOff, 
  Sparkles,
  BarChart3,
  Flame,
  History,
  Terminal
} from 'lucide-react';
import { AlertAudioService } from '../services/audioService';

interface HeaderProps {
  activeTab: 'radar' | 'gems' | 'chart' | 'sentiment' | 'history' | 'api';
  setActiveTab: (tab: 'radar' | 'gems' | 'chart' | 'sentiment' | 'history' | 'api') => void;
  latency: number;
  isWsConnected: boolean;
  isAudioMuted: boolean;
  setIsAudioMuted: (muted: boolean) => void;
  isPushEnabled: boolean;
  onTogglePush: () => void;
  onOpenConfig: () => void;
  onOpenMobileModal: () => void;
  isOffline: boolean;
  cachedTime?: string;
  activeSignalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  latency,
  isWsConnected,
  isAudioMuted,
  setIsAudioMuted,
  isPushEnabled,
  onTogglePush,
  onOpenConfig,
  onOpenMobileModal,
  isOffline,
  cachedTime,
  activeSignalCount
}) => {
  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    AlertAudioService.setMuted(next);
    if (!next) {
      AlertAudioService.playAlert('radar');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080b11]/95 backdrop-blur-md border-b border-white/[0.08]">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                CRYPTO<span className="text-emerald-400">RADAR</span>
              </span>
              <span className="hidden xs:inline-flex px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded">
                Bybit Linear
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Volume Surge & Rapid Movement Terminal
            </p>
          </div>
        </div>

        {/* Live Network & Latency Badge */}
        <div className="hidden md:flex items-center gap-2">
          {isOffline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Snapshot ({cachedTime || 'Cached'})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-mono">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWsConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isWsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="text-slate-300">
                {isWsConnected ? 'Bybit V5 WS' : 'REST Stream'}
              </span>
              <span className="text-emerald-400 font-semibold">{latency}ms</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Audio Alert Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              isAudioMuted 
                ? 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white' 
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
            }`}
            title={isAudioMuted ? 'Unmute Audio Alerts' : 'Mute Audio Alerts'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden xl:inline">{isAudioMuted ? 'Muted' : 'Sound ON'}</span>
          </button>

          {/* Push Notification Toggle */}
          <button
            onClick={onTogglePush}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              isPushEnabled 
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400' 
                : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={isPushEnabled ? 'Push Alerts Active' : 'Enable Device Push Alerts'}
          >
            {isPushEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            <span className="hidden xl:inline">{isPushEnabled ? 'Push Active' : 'Enable Push'}</span>
          </button>

          {/* Alert Configuration */}
          <button
            onClick={onOpenConfig}
            className="p-2 rounded-lg bg-slate-900/60 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all text-xs flex items-center gap-1.5"
            title="Configure Alert Thresholds & Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Download APK / AAB & Install App */}
          <button
            onClick={onOpenMobileModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 transition-all"
            title="Download APK, AAB & Install Mobile PWA"
          >
            <Smartphone className="w-4 h-4" />
            <span>APK / AAB</span>
            <span className="hidden xs:inline-block px-1.5 py-0.2 text-[9px] bg-black/30 rounded font-bold">
              v1.0
            </span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center overflow-x-auto no-scrollbar border-t border-white/[0.04]">
        <nav className="flex space-x-1 sm:space-x-2 py-2">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'radar'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Rapid Movement Radar</span>
            {activeSignalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-black font-bold">
                {activeSignalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('gems')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'gems'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hidden Gems Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'chart'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Terminal Pro Chart</span>
          </button>

          <button
            onClick={() => setActiveTab('sentiment')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'sentiment'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Social & Sentiment</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'history'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Backtest & History</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'api'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer API & JWT</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
