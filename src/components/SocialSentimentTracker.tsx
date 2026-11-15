import React, { useEffect, useState } from 'react';
import { 
  Flame, 
  MessageSquare, 
  Twitter, 
  TrendingUp, 
  Share2, 
  Sparkles, 
  AlertCircle,
  Hash,
  Activity,
  ThumbsUp
} from 'lucide-react';
import { SocialSentiment } from '../types/crypto';
import { SentimentService } from '../services/sentimentService';

export const SocialSentimentTracker: React.FC = () => {
  const [sentiment, setSentiment] = useState<SocialSentiment | null>(null);
  const [activeNarrative, setActiveNarrative] = useState<string>('AI & DePIN');

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      const data = await SentimentService.fetchSentiment();
      if (isMounted) setSentiment(data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!sentiment) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        Aggregating social sentiment streams...
      </div>
    );
  }

  const fngColor = 
    sentiment.fearAndGreedIndex >= 75 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
    sentiment.fearAndGreedIndex >= 55 ? 'text-teal-400 border-teal-500/30 bg-teal-500/10' :
    sentiment.fearAndGreedIndex >= 45 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
    'text-rose-400 border-rose-500/30 bg-rose-500/10';

  const socialAlerts = [
    { coin: '$SUI', spike: '+420%', catalyst: 'TVL ATH + Ecosystem Breakout', sentiment: 92, bias: 'BULLISH' },
    { coin: '$PEPE', spike: '+380%', catalyst: 'Binance perpetuals volume surge', sentiment: 88, bias: 'BULLISH' },
    { coin: '$TAO', spike: '+310%', catalyst: 'Decentralized Subnet expansion news', sentiment: 85, bias: 'BULLISH' },
    { coin: '$RENDER', spike: '+265%', catalyst: 'AI compute cluster partnership rumor', sentiment: 82, bias: 'BULLISH' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Fear & Greed + Social Velocity Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fear & Greed Card */}
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Market Sentiment
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${fngColor}`}>
                {sentiment.fearAndGreedLabel}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Fear & Greed Index</h3>
          </div>

          <div className="my-4 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke={sentiment.fearAndGreedIndex > 50 ? '#10b981' : '#f43f5e'}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="326.7"
                  strokeDashoffset={326.7 - (326.7 * sentiment.fearAndGreedIndex) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white font-mono">
                  {sentiment.fearAndGreedIndex}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
            <span>0 = Extreme Fear</span>
            <span>100 = Extreme Greed</span>
          </div>
        </div>

        {/* Social Buzz Velocity */}
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Social Media Radar
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Velocity High
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">X & Reddit Pulse</h3>
          </div>

          <div className="my-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Social Velocity Score</span>
                <span className="text-cyan-400 font-bold">{sentiment.socialVelocityScore}/100</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${sentiment.socialVelocityScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">1h Mention Surge</span>
                <span className="text-amber-400 font-bold">+{sentiment.socialVolumeSpike}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, sentiment.socialVolumeSpike / 4)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Bullish Consensus</span>
                <span className="text-emerald-400 font-bold">{sentiment.bullishSentimentPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${sentiment.bullishSentimentPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5 flex items-center gap-1.5">
            <Twitter className="w-3 h-3 text-cyan-400" />
            <span>LunarCrush & Twitter API stream sync</span>
          </div>
        </div>

        {/* Leading Narrative Card */}
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Macro Narrative
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Dominant Cycle
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">Dominant Storylines</h3>
          </div>

          <div className="my-3 space-y-2">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                #1 Active Trend
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {sentiment.trendingNarrative}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {sentiment.topSocialKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono border border-white/5"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
            <span>Identifies front-running setups</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Social Volume Spikes Pre-Pump Alert Matrix */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Social Volume Surges (Pre-Pump Leading Indicator)
              </h3>
              <p className="text-xs text-slate-400">
                Sudden 200%+ mention velocity acceleration detected prior to price expansion
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {socialAlerts.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs font-mono">
                  {item.coin}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.coin}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400">
                      {item.spike} Mentions
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {item.catalyst}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {item.sentiment}/100 Bullish
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
