import React, { useEffect, useState } from 'react';
import { 
  AlertFilterConfig, 
  RapidMovementSignal, 
  TickerData 
} from './types/crypto';
import { BybitMarketService, FEATURED_PAIRS } from './services/bybitService';
import { RapidMovementEngine } from './services/rapidMovementEngine';
import { AlertAudioService } from './services/audioService';
import { NotificationService } from './services/notificationService';
import { OfflineStorageService } from './services/offlineStorageService';

import { Header } from './components/Header';
import { RapidMovementRadar } from './components/RapidMovementRadar';
import { HiddenGemsScanner } from './components/HiddenGemsScanner';
import { InteractiveTerminalChart } from './components/InteractiveTerminalChart';
import { SocialSentimentTracker } from './components/SocialSentimentTracker';
import { HistoricalPerformance } from './components/HistoricalPerformance';
import { DeveloperApiHub } from './components/DeveloperApiHub';
import { AlertConfigModal } from './components/AlertConfigModal';
import { MobileDownloadModal } from './components/MobileDownloadModal';
import { ToastContainer } from './components/ToastContainer';

import { 
  Activity, 
  Sparkles, 
  BarChart3, 
  Flame, 
  History, 
  Terminal, 
  TrendingUp, 
  TrendingDown, 
  Radio,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'radar' | 'gems' | 'chart' | 'sentiment' | 'history' | 'api'>('radar');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('SUIUSDT');
  
  // Real-time market state
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map());
  const [activeSignals, setActiveSignals] = useState<RapidMovementSignal[]>([]);
  const [historicalSignals, setHistoricalSignals] = useState<RapidMovementSignal[]>([]);
  
  // Latency & Connection
  const [latency, setLatency] = useState<number>(18);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [cachedTime, setCachedTime] = useState<string>('');

  // Audio & Notification controls
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(() => NotificationService.isPermissionGranted());

  // Modals
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Alert filter configuration
  const [alertConfig, setAlertConfig] = useState<AlertFilterConfig>({
    minVolume24hUsd: 10000000,
    minVolumeSpike: 2.5,
    minMomentumScore: 75,
    directionFilter: 'ALL',
    onlyGems: false,
    enableAudio: true,
    alertSound: 'radar',
    enableBrowserPush: true,
    enableVibration: true,
    fundingPinchSensitivity: 0.00015
  });

  // PWA Install prompt listener
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Online / Offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      const snap = OfflineStorageService.getCachedSnapshot();
      if (snap) setCachedTime(snap.cachedDateStr);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Bybit services and engine
  useEffect(() => {
    BybitMarketService.init();
    RapidMovementEngine.init();

    const unsubTickers = BybitMarketService.subscribe((newTickers) => {
      setTickers(newTickers);
      RapidMovementEngine.updateSignalPnL(newTickers);
    });

    const unsubLatency = BybitMarketService.subscribeLatency((ms, wsConn) => {
      setLatency(ms);
      setIsWsConnected(wsConn);
    });

    const unsubSignals = RapidMovementEngine.subscribe((signals) => {
      setActiveSignals(signals);
    });

    const unsubNewAlert = RapidMovementEngine.onNewAlert((newSignal) => {
      if (alertConfig.enableAudio && !isAudioMuted) {
        AlertAudioService.playAlert(alertConfig.alertSound);
      }
      NotificationService.triggerSignalAlert(newSignal, alertConfig.enableVibration);
    });

    setHistoricalSignals(RapidMovementEngine.getHistoricalSignals());

    // Snapshot cache timer (every 10 seconds)
    const snapshotTimer = setInterval(() => {
      const currentTickers = BybitMarketService.getTickers();
      const currentSignals = RapidMovementEngine.getActiveSignals();
      if (currentTickers.size > 0) {
        OfflineStorageService.saveSnapshot(currentTickers, currentSignals);
      }
    }, 10000);

    return () => {
      unsubTickers();
      unsubLatency();
      unsubSignals();
      unsubNewAlert();
      clearInterval(snapshotTimer);
    };
  }, [alertConfig, isAudioMuted]);

  // Handle manual or test alert trigger
  const handleTriggerTestAlert = () => {
    const pair = FEATURED_PAIRS[Math.floor(Math.random() * FEATURED_PAIRS.length)];
    const ticker = tickers.get(pair.symbol) || {
      symbol: pair.symbol,
      baseCoin: pair.base,
      quoteCoin: 'USDT',
      lastPrice: 3.45,
      prevPrice24h: 3.10,
      price24hPcnt: 11.29,
      highPrice24h: 3.65,
      lowPrice24h: 3.02,
      turnover24h: 125000000,
      volume24h: 40000000,
      fundingRate: -0.00019,
      nextFundingTime: Date.now() + 10000,
      openInterest: 500000,
      openInterestValue: 1725000,
      bidPrice: 3.448,
      askPrice: 3.452,
      bidQty: 12000,
      askQty: 6500,
      tickDirection: 'PlusTick',
      lastUpdated: Date.now(),
      isGem: pair.isGem
    };

    const dummyCandles = [
      { time: Date.now() - 300000, open: 3.2, high: 3.3, low: 3.18, close: 3.28, volume: 15000 },
      { time: Date.now() - 150000, open: 3.28, high: 3.42, low: 3.26, close: 3.41, volume: 85000 },
      { time: Date.now(), open: 3.41, high: 3.52, low: 3.39, close: 3.48, volume: 120000 }
    ];

    const generated = RapidMovementEngine.evaluatePair(ticker, dummyCandles as any, {
      ...alertConfig,
      minVolumeSpike: 1.0,
      minMomentumScore: 50
    });

    if (generated) {
      AlertAudioService.playAlert(alertConfig.alertSound);
      NotificationService.triggerSignalAlert(generated, alertConfig.enableVibration);
    }
  };

  const handleTogglePush = async () => {
    const granted = await NotificationService.requestPermission();
    setIsPushEnabled(granted);
    setAlertConfig(p => ({ ...p, enableBrowserPush: granted }));
  };

  const handleSelectPair = (sym: string) => {
    setSelectedSymbol(sym);
    setActiveTab('chart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeTicker = tickers.get(selectedSymbol);

  return (
    <div className="min-h-screen bg-[#080b11] text-[#f1f5f9] flex flex-col font-sans pb-16 md:pb-6 selection:bg-emerald-500/30">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        latency={latency}
        isWsConnected={isWsConnected}
        isAudioMuted={isAudioMuted}
        setIsAudioMuted={setIsAudioMuted}
        isPushEnabled={isPushEnabled}
        onTogglePush={handleTogglePush}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        isOffline={isOffline}
        cachedTime={cachedTime}
        activeSignalCount={activeSignals.length}
      />

      {/* Live Market Ticker Marquee Ribbon */}
      <div className="bg-[#0b0f19] border-b border-white/[0.06] overflow-x-auto no-scrollbar py-2 px-3">
        <div className="flex items-center space-x-3 w-max">
          <div className="flex items-center gap-1.5 pr-2 border-r border-white/10 text-xs font-mono font-bold text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>BYBIT LINEAR:</span>
          </div>

          {Array.from(tickers.values()).slice(0, 12).map((t) => {
            const isPos = t.price24hPcnt >= 0;
            const isSelected = t.symbol === selectedSymbol;

            return (
              <button
                key={t.symbol}
                onClick={() => handleSelectPair(t.symbol)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
                  isSelected 
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white' 
                    : 'bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/20'
                }`}
              >
                <span className="font-bold">{t.baseCoin}</span>
                <span className="text-white">
                  ${t.lastPrice < 1 ? t.lastPrice.toFixed(4) : t.lastPrice.toLocaleString()}
                </span>
                <span className={`text-[11px] font-semibold flex items-center ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? `+${t.price24hPcnt.toFixed(1)}%` : `${t.price24hPcnt.toFixed(1)}%`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {activeTab === 'radar' && (
          <RapidMovementRadar
            signals={activeSignals}
            tickers={tickers}
            onSelectPair={handleSelectPair}
          />
        )}

        {activeTab === 'gems' && (
          <HiddenGemsScanner
            tickers={tickers}
            onSelectPair={handleSelectPair}
            selectedSymbol={selectedSymbol}
          />
        )}

        {activeTab === 'chart' && (
          <InteractiveTerminalChart
            symbol={selectedSymbol}
            ticker={activeTicker}
          />
        )}

        {activeTab === 'sentiment' && (
          <SocialSentimentTracker />
        )}

        {activeTab === 'history' && (
          <HistoricalPerformance
            historicalSignals={historicalSignals}
          />
        )}

        {activeTab === 'api' && (
          <DeveloperApiHub />
        )}
      </main>

      {/* Floating In-App Notifications Container */}
      <ToastContainer onSelectPair={handleSelectPair} />

      {/* Alert Filter Modal */}
      <AlertConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={alertConfig}
        onSaveConfig={setAlertConfig}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      {/* Mobile Download APK / AAB Modal */}
      <MobileDownloadModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />

      {/* Bottom Mobile Floating Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0e17]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === 'radar' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('gems')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === 'gems' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Gems</span>
        </button>

        <button
          onClick={() => setActiveTab('chart')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === 'chart' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Chart</span>
        </button>

        <button
          onClick={() => setActiveTab('sentiment')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
            activeTab === 'sentiment' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Social</span>
        </button>

        <button
          onClick={() => setIsMobileModalOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold text-emerald-400"
        >
          <Smartphone className="w-4 h-4" />
          <span>APK</span>
        </button>
      </div>
    </div>
  );
}
