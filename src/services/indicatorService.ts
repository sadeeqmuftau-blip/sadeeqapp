import { Candle, TechnicalIndicators } from '../types/crypto';

export class IndicatorCalculator {
  /**
   * Calculate Relative Strength Index (RSI) using Wilders Smoothing
   */
  public static calculateRSI(candles: Candle[], period: number = 14): number {
    if (candles.length <= period) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = candles[i].close - candles[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < candles.length; i++) {
      const change = candles[i].close - candles[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return Number((100 - (100 / (1 + rs))).toFixed(1));
  }

  /**
   * Calculate Exponential Moving Average
   */
  public static calculateEMA(values: number[], period: number): number {
    if (values.length === 0) return 0;
    if (values.length < period) period = values.length;

    const multiplier = 2 / (period + 1);
    let ema = values.slice(0, period).reduce((sum, v) => sum + v, 0) / period;

    for (let i = period; i < values.length; i++) {
      ema = (values[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  /**
   * Calculate MACD (12, 26, 9)
   */
  public static calculateMACD(candles: Candle[]): {
    line: number;
    signal: number;
    histogram: number;
    cross: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  } {
    const closes = candles.map(c => c.close);
    if (closes.length < 26) {
      return { line: 0, signal: 0, histogram: 0, cross: 'NEUTRAL' };
    }

    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macdLine = ema12 - ema26;

    // Approximate signal line
    const signalLine = macdLine * 0.88;
    const histogram = macdLine - signalLine;

    const cross = histogram > 0.05 ? 'BULLISH' : histogram < -0.05 ? 'BEARISH' : 'NEUTRAL';

    return {
      line: Number(macdLine.toFixed(4)),
      signal: Number(signalLine.toFixed(4)),
      histogram: Number(histogram.toFixed(4)),
      cross
    };
  }

  /**
   * Calculate Bollinger Bands (20 periods, 2 standard deviations)
   */
  public static calculateBollingerBands(candles: Candle[], period: number = 20, stdDevMultiplier: number = 2): {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    squeeze: boolean;
  } {
    const slice = candles.slice(-period);
    if (slice.length < 5) {
      const p = candles[candles.length - 1]?.close || 100;
      return { upper: p * 1.02, middle: p, lower: p * 0.98, bandwidth: 4.0, squeeze: false };
    }

    const closes = slice.map(c => c.close);
    const sum = closes.reduce((acc, c) => acc + c, 0);
    const middle = sum / closes.length;

    const variance = closes.reduce((acc, c) => acc + Math.pow(c - middle, 2), 0) / closes.length;
    const stdDev = Math.sqrt(variance);

    const upper = middle + stdDev * stdDevMultiplier;
    const lower = middle - stdDev * stdDevMultiplier;
    const bandwidth = middle > 0 ? ((upper - lower) / middle) * 100 : 0;
    const squeeze = bandwidth < 2.5; // low volatility compression, ready to explode

    return {
      upper: Number(upper.toFixed(4)),
      middle: Number(middle.toFixed(4)),
      lower: Number(lower.toFixed(4)),
      bandwidth: Number(bandwidth.toFixed(2)),
      squeeze
    };
  }

  /**
   * Calculate Volume Weighted Average Price (VWAP)
   */
  public static calculateVWAP(candles: Candle[]): number {
    if (candles.length === 0) return 0;
    let cumulativeTypicalPriceVolume = 0;
    let cumulativeVolume = 0;

    for (const c of candles) {
      const typicalPrice = (c.high + c.low + c.close) / 3;
      cumulativeTypicalPriceVolume += typicalPrice * c.volume;
      cumulativeVolume += c.volume;
    }

    return cumulativeVolume > 0 
      ? Number((cumulativeTypicalPriceVolume / cumulativeVolume).toFixed(4))
      : candles[candles.length - 1].close;
  }

  /**
   * Calculate Average True Range (ATR)
   */
  public static calculateATR(candles: Candle[], period: number = 14): number {
    if (candles.length < 2) return 0;
    const trueRanges: number[] = [];

    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }

    const slice = trueRanges.slice(-period);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    return Number(avg.toFixed(4));
  }

  /**
   * Calculate Volume Spike Multiple (Current volume vs 20-period volume SMA)
   */
  public static calculateVolumeSpike(candles: Candle[], currentVol?: number): number {
    if (candles.length < 5) return 1.0;
    const recentCandles = candles.slice(-21, -1);
    if (recentCandles.length === 0) return 1.0;

    const avgVol = recentCandles.reduce((acc, c) => acc + c.volume, 0) / recentCandles.length;
    const activeVol = currentVol ?? candles[candles.length - 1].volume;

    if (avgVol <= 0) return 1.0;
    return Number((activeVol / avgVol).toFixed(2));
  }

  /**
   * Derive full technical indicators suite for a ticker
   */
  public static computeAllIndicators(
    candles: Candle[],
    bidQty: number,
    askQty: number,
    fundingRate: number
  ): TechnicalIndicators {
    const closes = candles.map(c => c.close);
    const lastPrice = closes[closes.length - 1] || 1;

    const rsi = this.calculateRSI(candles);
    const macd = this.calculateMACD(candles);
    const bollinger = this.calculateBollingerBands(candles);
    const vwap = this.calculateVWAP(candles);
    const atr = this.calculateATR(candles);
    const volumeSpikeMultiple = this.calculateVolumeSpike(candles);

    const ema9 = this.calculateEMA(closes, 9);
    const ema21 = this.calculateEMA(closes, 21);
    const ema50 = this.calculateEMA(closes, 50);
    const ema200 = this.calculateEMA(closes, 200);

    // Orderbook imbalance (-100% to +100%)
    const totalQty = (bidQty + askQty) || 1;
    const orderbookImbalance = Number((((bidQty - askQty) / totalQty) * 100).toFixed(1));

    // RSI Divergence detection
    let rsiDivergence: 'BULLISH_DIV' | 'BEARISH_DIV' | 'NONE' = 'NONE';
    if (candles.length >= 20) {
      const recentPriceLow = Math.min(...candles.slice(-10).map(c => c.low));
      const olderPriceLow = Math.min(...candles.slice(-20, -10).map(c => c.low));
      if (recentPriceLow < olderPriceLow && rsi > 35 && rsi < 50) {
        rsiDivergence = 'BULLISH_DIV';
      } else if (lastPrice > bollinger.upper && rsi < 65) {
        rsiDivergence = 'BEARISH_DIV';
      }
    }

    // Liquidation risk assessment
    let liquidationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'LOW';
    if (Math.abs(fundingRate) > 0.05 || volumeSpikeMultiple > 4.5) {
      liquidationRisk = 'EXTREME';
    } else if (Math.abs(fundingRate) > 0.02 || volumeSpikeMultiple > 3.0) {
      liquidationRisk = 'HIGH';
    } else if (Math.abs(fundingRate) > 0.01 || volumeSpikeMultiple > 2.0) {
      liquidationRisk = 'MEDIUM';
    }

    return {
      rsi,
      rsiDivergence,
      macd,
      bollinger,
      vwap,
      ema9: Number(ema9.toFixed(4)),
      ema21: Number(ema21.toFixed(4)),
      ema50: Number(ema50.toFixed(4)),
      ema200: Number(ema200.toFixed(4)),
      volumeSpikeMultiple,
      atr,
      orderbookImbalance,
      liquidationRisk
    };
  }
}
