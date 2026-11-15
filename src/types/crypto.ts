export type TickDirection = 'ZeroPlusTick' | 'PlusTick' | 'MinusTick' | 'ZeroMinusTick';

export interface TickerData {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
  lastPrice: number;
  prevPrice24h: number;
  price24hPcnt: number;
  highPrice24h: number;
  lowPrice24h: number;
  turnover24h: number; // USD Volume
  volume24h: number;
  fundingRate: number;
  nextFundingTime: number;
  openInterest: number;
  openInterestValue: number;
  bidPrice: number;
  askPrice: number;
  bidQty: number;
  askQty: number;
  tickDirection: TickDirection;
  lastUpdated: number;
  priceChangeDirection?: 'up' | 'down' | 'neutral';
  isGem?: boolean;
}

export interface TechnicalIndicators {
  rsi: number;
  rsiDivergence: 'BULLISH_DIV' | 'BEARISH_DIV' | 'NONE';
  macd: {
    line: number;
    signal: number;
    histogram: number;
    cross: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    squeeze: boolean;
  };
  vwap: number;
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  volumeSpikeMultiple: number; // e.g., 3.8x of 20-period SMA
  atr: number; // Average True Range
  orderbookImbalance: number; // -100 to +100 (%)
  liquidationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

export interface SocialSentiment {
  fearAndGreedIndex: number;
  fearAndGreedLabel: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  socialVelocityScore: number; // 0-100
  socialVolumeSpike: number; // percentage surge in mentions
  twitterSentimentScore: number;
  redditSentimentScore: number;
  trendingNarrative: string;
  topSocialKeywords: string[];
  bullishSentimentPercent: number;
}

export type SignalType = 
  | 'VOLUME_EXPLOSION' 
  | 'SQUEEZE_BREAKOUT' 
  | 'WHALE_ACCUMULATION' 
  | 'FUNDING_PINCH' 
  | 'HIDDEN_GEM_PUMP';

export type SignalDirection = 'LONG' | 'SHORT';

export interface RapidMovementSignal {
  id: string;
  symbol: string;
  baseCoin: string;
  direction: SignalDirection;
  signalType: SignalType;
  momentumScore: number; // 0 - 100
  breakoutProbability: number; // e.g. 89%
  triggerReason: string;
  entryPrice: number;
  target1: number;
  target2: number;
  target3: number;
  stopLoss: number;
  riskRewardRatio: number;
  timestamp: number;
  status: 'ACTIVE' | 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'STOPPED_OUT';
  currentProfitPercent: number;
  volumeSurgeMultiple: number;
  fundingRate: number;
  isGem: boolean;
  convergenceFactors: string[];
}

export interface AlertFilterConfig {
  minVolume24hUsd: number;
  minVolumeSpike: number;
  minMomentumScore: number;
  directionFilter: 'ALL' | 'LONG' | 'SHORT';
  onlyGems: boolean;
  enableAudio: boolean;
  alertSound: 'radar' | 'sonar' | 'bleep' | 'synth';
  enableBrowserPush: boolean;
  enableVibration: boolean;
  fundingPinchSensitivity: number; // funding rate threshold e.g. 0.015%
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalSignalStats {
  totalAlerts: number;
  winRate: number;
  avgReturnPcnt: number;
  profitFactor: number;
  maxConsecutiveWins: number;
  tp1Hits: number;
  tp2Hits: number;
  tp3Hits: number;
  stoppedOut: number;
}

export interface ApiTokenRecord {
  id: string;
  name: string;
  token: string;
  role: 'READ_ONLY' | 'TRADER' | 'WEBHOOK_SUBSCRIBER' | 'ADMIN';
  createdAt: string;
  expiresIn: string;
  rateLimit: string;
}
