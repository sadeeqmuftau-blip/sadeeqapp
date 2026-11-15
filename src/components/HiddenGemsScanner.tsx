import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowUpDown, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Layers, 
  Eye, 
  BarChart2,
  DollarSign
} from 'lucide-react';
import { TickerData } from '../types/crypto';

interface HiddenGemsScannerProps {
  tickers: Map<string, TickerData>;
  onSelectPair: (symbol: string) => void;
  selectedSymbol: string;
}

export const HiddenGemsScanner: React.FC<HiddenGemsScannerProps> = ({
  tickers,
  onSelectPair,
  selectedSymbol
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'GEMS' | 'SURGE' | 'SHORT_SQUEEZE'>('GEMS');
  const [sortBy, setSortBy] = useState<'surge' | 'change' | 'turnover' | 'funding'>('surge');

  const tickerList = Array.from(tickers.values());

  const filtered = tickerList.filter(t => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!t.symbol.toLowerCase().includes(q) && !t.baseCoin.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Category filter
    if (filterType === 'GEMS') return t.isGem;
    if (filterType === 'SURGE') return t.price24hPcnt > 5 || t.turnover24h > 100000000;
    if (filterType === 'SHORT_SQUEEZE') return t.fundingRate < -0.0001;
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'surge') {
      const aSurge = (a.turnover24h / 50000000);
      const bSurge = (b.turnover24h / 50000000);
      return bSurge - aSurge;
    }
    if (sortBy === 'change') return b.price24hPcnt - a.price24hPcnt;
    if (sortBy === 'turnover') return b.turnover24h - a.turnover24h;
    if (sortBy === 'funding') return a.fundingRate - b.fundingRate; // most negative first
    return 0;
  });

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Hidden Gems & High-Beta Momentum Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Low-float and explosive volume perpetuals on Bybit Linear
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter pair (e.g. SUI, PEPE)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setFilterType('GEMS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'GEMS' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              💎 Gems
            </button>
            <button
              onClick={() => setFilterType('SURGE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'SURGE' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Surge
            </button>
            <button
              onClick={() => setFilterType('SHORT_SQUEEZE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'SHORT_SQUEEZE' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔥 Squeeze
            </button>
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <th className="p-3.5">Asset / Pair</th>
              <th className="p-3.5">Live Price</th>
              <th className="p-3.5 cursor-pointer hover:text-white" onClick={() => setSortBy('change')}>
                <div className="flex items-center gap-1">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5 cursor-pointer hover:text-white" onClick={() => setSortBy('turnover')}>
                <div className="flex items-center gap-1">
                  <span>24h Turnover</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5 cursor-pointer hover:text-white" onClick={() => setSortBy('funding')}>
                <div className="flex items-center gap-1">
                  <span>Funding Rate</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5">Volume Multiplier</th>
              <th className="p-3.5 text-right">Terminal Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs font-mono">
            {filtered.map((t) => {
              const isSelected = t.symbol === selectedSymbol;
              const isPositive = t.price24hPcnt >= 0;
              const isNegativeFunding = t.fundingRate < -0.0001;
              const volumeSurgeMultiple = (t.turnover24h / 65000000).toFixed(1);

              return (
                <tr
                  key={t.symbol}
                  className={`hover:bg-white/[0.04] transition-colors ${
                    isSelected ? 'bg-emerald-500/10' : ''
                  }`}
                >
                  {/* Pair Name & Badge */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                        {t.baseCoin.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white tracking-wide">{t.symbol}</span>
                          {t.isGem && (
                            <span className="px-1.5 py-0.2 text-[9px] rounded font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              GEM
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-sans">
                          {t.baseCoin} / USDT Perpetual
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Live Price with Flash */}
                  <td className="p-3.5">
                    <span className={`font-bold text-sm ${t.priceChangeDirection === 'up' ? 'text-emerald-400' : t.priceChangeDirection === 'down' ? 'text-rose-400' : 'text-slate-100'}`}>
                      ${t.lastPrice < 1 ? t.lastPrice.toFixed(6) : t.lastPrice.toLocaleString()}
                    </span>
                  </td>

                  {/* 24h Change */}
                  <td className="p-3.5">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                      isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isPositive ? `+${t.price24hPcnt.toFixed(2)}%` : `${t.price24hPcnt.toFixed(2)}%`}</span>
                    </div>
                  </td>

                  {/* 24h Turnover */}
                  <td className="p-3.5 text-slate-300">
                    <div>{formatNumber(t.turnover24h)}</div>
                    <span className="text-[10px] text-slate-500">
                      OI: {formatNumber(t.openInterestValue)}
                    </span>
                  </td>

                  {/* Funding Rate */}
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      isNegativeFunding 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {(t.fundingRate * 100).toFixed(4)}%
                    </span>
                    {isNegativeFunding && (
                      <span className="block text-[9px] text-rose-400 font-sans mt-0.5 font-bold">
                        ⚡ Short Squeeze Squeeze
                      </span>
                    )}
                  </td>

                  {/* Volume Surge Multiple */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, parseFloat(volumeSurgeMultiple) * 20)}%` }}
                        />
                      </div>
                      <span className="font-bold text-amber-400 text-xs">
                        {volumeSurgeMultiple}x
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onSelectPair(t.symbol)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Active Chart' : 'Inspect'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
