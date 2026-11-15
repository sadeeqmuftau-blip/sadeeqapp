import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  Flame,
  Clock,
  Compass,
  Sparkles,
  Percent
} from 'lucide-react';
import { RapidMovementSignal, TickerData } from '../types/crypto';

interface RapidMovementRadarProps {
  signals: RapidMovementSignal[];
  tickers: Map<string, TickerData>;
  onSelectPair: (symbol: string) => void;
  onTradeSetupCopied?: (symbol: string) => void;
}

export const RapidMovementRadar: React.FC<RapidMovementRadarProps> = ({
  signals,
  tickers,
  onSelectPair
}) => {
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSignals = signals.filter(s => {
    if (filterDirection === 'ALL') return true;
    return s.direction === filterDirection;
  });

  const handleCopySetup = (sig: RapidMovementSignal) => {
    const text = `🚨 BYBIT LINEAR SIGNAL: ${sig.direction} #${sig.baseCoin}\n` +
      `⚡ Type: ${sig.signalType.replace(/_/g, ' ')}\n` +
      `🎯 Entry: $${sig.entryPrice}\n` +
      `🎯 Target 1: $${sig.target1}\n` +
      `🎯 Target 2: $${sig.target2}\n` +
      `🎯 Target 3: $${sig.target3}\n` +
      `🛑 Stop-Loss: $${sig.stopLoss}\n` +
      `📊 R:R Ratio: 1:${sig.riskRewardRatio} | Conviction: ${sig.breakoutProbability}%\n` +
      `🔥 Volume Surge: ${sig.volumeSurgeMultiple.toFixed(1)}x`;
    
    navigator.clipboard?.writeText(text);
    setCopiedId(sig.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: Radar Squeeze & Imminent Breakout Detection */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-4 sm:p-6 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="relative w-64 h-64 rounded-full border border-emerald-500/40 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border border-emerald-500/30 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-emerald-500/20"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/20 to-transparent animate-radar origin-center rounded-full"></div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Zap className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                Live Convergence Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Scanning Bybit Linear Perpetuals
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Rapid Movement <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">About to Start</span> Radar
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Algorithmic detection of sudden volume multiples, perpetual funding pinches, and volatility compression breakouts before large-scale liquidity cascades.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-white/10 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setFilterDirection('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterDirection === 'ALL'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Signals ({signals.length})
            </button>
            <button
              onClick={() => setFilterDirection('LONG')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                filterDirection === 'LONG'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Long Only
            </button>
            <button
              onClick={() => setFilterDirection('SHORT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                filterDirection === 'SHORT'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3 h-3 text-rose-400" />
              Short Only
            </button>
          </div>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSignals.map((signal) => {
          const liveTicker = tickers.get(signal.symbol);
          const currentPrice = liveTicker ? liveTicker.lastPrice : signal.entryPrice;
          const isLong = signal.direction === 'LONG';
          const pnlPcnt = signal.currentProfitPercent;
          const isProfitable = pnlPcnt >= 0;

          return (
            <div
              key={signal.id}
              className={`relative rounded-2xl p-5 border transition-all ${
                isLong
                  ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/90 border-rose-500/30 hover:border-rose-500/50 shadow-lg shadow-rose-950/20'
              }`}
            >
              {/* Top Row: Symbol, Type, Momentum Score & Direction */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm tracking-wider ${
                      isLong
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {signal.baseCoin}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white tracking-wide">
                        {signal.symbol}
                      </h3>
                      {signal.isGem && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          <Sparkles className="w-3 h-3" />
                          GEM
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Perp
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(signal.timestamp).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">
                        Vol: {signal.volumeSurgeMultiple.toFixed(1)}x Surge
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status and Direction Badge */}
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isLong
                        ? 'bg-emerald-500 text-black'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {isLong ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{signal.direction}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    <span className="text-slate-400">Conviction:</span>
                    <span className="text-emerald-400 font-bold">{signal.breakoutProbability}%</span>
                  </div>
                </div>
              </div>

              {/* Trigger Reason & Signal Category Banner */}
              <div className="mb-4 p-2.5 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="line-clamp-1">{signal.triggerReason}</span>
                </div>
                <span className="shrink-0 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {signal.signalType.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Live Price & Targets Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-white/5">
                  <span className="text-slate-400 text-[10px] block">Entry Price</span>
                  <span className="text-white font-bold text-sm sm:text-base">
                    ${signal.entryPrice}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-white/5">
                  <span className="text-slate-400 text-[10px] block">Current Tick</span>
                  <span className={`font-bold text-sm sm:text-base ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${currentPrice}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-white/5">
                  <span className="text-slate-400 text-[10px] block">Take Profit 2</span>
                  <span className="text-emerald-400 font-bold text-sm sm:text-base">
                    ${signal.target2}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-white/5">
                  <span className="text-slate-400 text-[10px] block">Stop Loss</span>
                  <span className="text-rose-400 font-bold text-sm sm:text-base">
                    ${signal.stopLoss}
                  </span>
                </div>
              </div>

              {/* Convergence Factors Checklist */}
              <div className="mb-4 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Convergence Trigger Points:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {signal.convergenceFactors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/30 px-2 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons & Outcome Status */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1 ${
                    isProfitable 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    <Percent className="w-3 h-3" />
                    <span>PnL: {pnlPcnt > 0 ? `+${pnlPcnt}%` : `${pnlPcnt}%`}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    signal.status === 'ACTIVE'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : signal.status.includes('TP')
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {signal.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySetup(signal)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-all"
                  >
                    {copiedId === signal.id ? 'Copied ✓' : 'Copy Setup'}
                  </button>

                  <button
                    onClick={() => onSelectPair(signal.symbol)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <span>Pro Chart</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
