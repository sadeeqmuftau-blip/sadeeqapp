import React, { useEffect, useRef, useState } from 'react';
import { 
  Candle, 
  TechnicalIndicators, 
  TickerData 
} from '../types/crypto';
import { BybitMarketService } from '../services/bybitService';
import { IndicatorCalculator } from '../services/indicatorService';
import { 
  Layers, 
  Maximize2, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  RefreshCw,
  BarChart2
} from 'lucide-react';

interface InteractiveTerminalChartProps {
  symbol: string;
  ticker?: TickerData;
}

export const InteractiveTerminalChart: React.FC<InteractiveTerminalChartProps> = ({
  symbol,
  ticker
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [timeframe, setTimeframe] = useState<'1' | '5' | '15' | '60'>('5');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [showIndicators, setShowIndicators] = useState<{
    bollinger: boolean;
    ema: boolean;
    vwap: boolean;
    rsi: boolean;
  }>({
    bollinger: true,
    ema: true,
    vwap: true,
    rsi: true
  });

  // Load candles on symbol or timeframe change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      const data = await BybitMarketService.fetchCandles(symbol, timeframe, 65);
      if (isMounted) {
        setCandles(data);
        if (data.length > 0) {
          const lastCandle = data[data.length - 1];
          const calculated = IndicatorCalculator.computeAllIndicators(
            data,
            ticker?.bidQty || 1000,
            ticker?.askQty || 800,
            ticker?.fundingRate || 0
          );
          setIndicators(calculated);
        }
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol, timeframe, ticker?.fundingRate]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina DPI scale
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Sub-chart heights: Main chart takes 70%, Volume takes 15%, RSI takes 15%
    const mainHeight = height * 0.65;
    const volHeight = height * 0.15;
    const rsiHeight = height * 0.18;
    const rsiTop = mainHeight + volHeight + 5;

    // Clear background
    ctx.fillStyle = '#080b11';
    ctx.fillRect(0, 0, width, height);

    // Compute min / max price
    const minPrice = Math.min(...candles.map(c => c.low)) * 0.998;
    const maxPrice = Math.max(...candles.map(c => c.high)) * 1.002;
    const priceRange = maxPrice - minPrice || 1;

    const maxVolume = Math.max(...candles.map(c => c.volume)) || 1;

    // Coordinates mapping
    const priceToY = (price: number) => {
      return mainHeight - ((price - minPrice) / priceRange) * (mainHeight - 30) - 15;
    };

    const count = candles.length;
    const candleWidth = Math.max(3, (width - 60) / count - 3);
    const stepX = (width - 60) / count;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const y = (mainHeight / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width - 55, y);
      ctx.stroke();

      // Price label on right axis
      const p = maxPrice - (priceRange / gridSteps) * i;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(p < 1 ? p.toFixed(5) : p.toFixed(2), width - 50, y + 3);
    }

    // 1. Draw Bollinger Bands Area & Lines if enabled
    if (showIndicators.bollinger && candles.length > 20) {
      const bUpper: { x: number; y: number }[] = [];
      const bLower: { x: number; y: number }[] = [];
      const bMid: { x: number; y: number }[] = [];

      for (let i = 15; i < count; i++) {
        const slice = candles.slice(0, i + 1);
        const bb = IndicatorCalculator.calculateBollingerBands(slice, 20);
        const x = i * stepX + candleWidth / 2;
        bUpper.push({ x, y: priceToY(bb.upper) });
        bLower.push({ x, y: priceToY(bb.lower) });
        bMid.push({ x, y: priceToY(bb.middle) });
      }

      // Shaded Bollinger Band channel
      if (bUpper.length > 1) {
        ctx.beginPath();
        ctx.moveTo(bUpper[0].x, bUpper[0].y);
        bUpper.forEach(pt => ctx.lineTo(pt.x, pt.y));
        for (let j = bLower.length - 1; j >= 0; j--) {
          ctx.lineTo(bLower[j].x, bLower[j].y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
        ctx.fill();

        // Upper line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 1.2;
        bUpper.forEach((pt, idx) => (idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
        ctx.stroke();

        // Lower line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        bLower.forEach((pt, idx) => (idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
        ctx.stroke();
      }
    }

    // 2. Draw Candlesticks & Volume Bars
    candles.forEach((c, i) => {
      const x = i * stepX;
      const isBullish = c.close >= c.open;
      const bodyTop = priceToY(Math.max(c.open, c.close));
      const bodyBottom = priceToY(Math.min(c.open, c.close));
      const bodyHeight = Math.max(2, bodyBottom - bodyTop);

      const wickHigh = priceToY(c.high);
      const wickLow = priceToY(c.low);
      const centerX = x + candleWidth / 2;

      // Wick
      ctx.strokeStyle = isBullish ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(centerX, wickHigh);
      ctx.lineTo(centerX, wickLow);
      ctx.stroke();

      // Candle body
      ctx.fillStyle = isBullish ? '#10b981' : '#f43f5e';
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);

      // Volume bar
      const vY = mainHeight + volHeight - (c.volume / maxVolume) * (volHeight - 5);
      ctx.fillStyle = isBullish ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)';
      ctx.fillRect(x, vY, candleWidth, mainHeight + volHeight - vY);
    });

    // 3. Draw EMA lines if enabled
    if (showIndicators.ema && candles.length > 21) {
      const closes = candles.map(c => c.close);
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4'; // EMA 9 (cyan)
      ctx.lineWidth = 1.5;
      candles.forEach((_, i) => {
        if (i < 8) return;
        const ema = IndicatorCalculator.calculateEMA(closes.slice(0, i + 1), 9);
        const x = i * stepX + candleWidth / 2;
        const y = priceToY(ema);
        if (i === 8) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // EMA 21 (amber)
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      candles.forEach((_, i) => {
        if (i < 20) return;
        const ema = IndicatorCalculator.calculateEMA(closes.slice(0, i + 1), 21);
        const x = i * stepX + candleWidth / 2;
        const y = priceToY(ema);
        if (i === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 4. Draw RSI Sub-chart if enabled
    if (showIndicators.rsi) {
      // Background separator
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, rsiTop);
      ctx.lineTo(width, rsiTop);
      ctx.stroke();

      // RSI Overbought (70) and Oversold (30) threshold lines
      const rsiToY = (rsiVal: number) => {
        return rsiTop + rsiHeight - (rsiVal / 100) * (rsiHeight - 8) - 4;
      };

      const y70 = rsiToY(70);
      const y30 = rsiToY(30);

      // 70 level
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, y70);
      ctx.lineTo(width - 55, y70);
      ctx.stroke();

      // 30 level
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, y30);
      ctx.lineTo(width - 55, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('RSI 14', 6, rsiTop + 14);
      ctx.fillText('70', width - 45, y70 + 3);
      ctx.fillText('30', width - 45, y30 + 3);

      // Plot RSI curve
      ctx.beginPath();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      for (let i = 14; i < count; i++) {
        const rsiVal = IndicatorCalculator.calculateRSI(candles.slice(0, i + 1), 14);
        const x = i * stepX + candleWidth / 2;
        const y = rsiToY(rsiVal);
        if (i === 14) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

  }, [candles, showIndicators]);

  // Mouse hover listener for crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const count = candles.length;
    const stepX = (rect.width - 60) / count;
    const index = Math.min(count - 1, Math.max(0, Math.floor(x / stepX)));
    setHoveredCandle(candles[index]);
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white tracking-wide">{symbol}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Feed
            </span>
          </div>

          {ticker && (
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="font-bold text-white">
                ${ticker.lastPrice < 1 ? ticker.lastPrice.toFixed(6) : ticker.lastPrice.toLocaleString()}
              </span>
              <span className={`text-xs font-semibold ${ticker.price24hPcnt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {ticker.price24hPcnt >= 0 ? `+${ticker.price24hPcnt.toFixed(2)}%` : `${ticker.price24hPcnt.toFixed(2)}%`}
              </span>
            </div>
          )}
        </div>

        {/* Timeframes and Indicator Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
            {(['1', '5', '15', '60'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timeframe === tf ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf === '60' ? '1H' : `${tf}m`}
              </button>
            ))}
          </div>

          {/* Indicator toggles */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setShowIndicators(p => ({ ...p, bollinger: !p.bollinger }))}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                showIndicators.bollinger ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'
              }`}
            >
              BB
            </button>
            <button
              onClick={() => setShowIndicators(p => ({ ...p, ema: !p.ema }))}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                showIndicators.ema ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'
              }`}
            >
              EMA(9/21)
            </button>
            <button
              onClick={() => setShowIndicators(p => ({ ...p, rsi: !p.rsi }))}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                showIndicators.rsi ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500'
              }`}
            >
              RSI
            </button>
          </div>
        </div>
      </div>

      {/* Candlestick Tooltip Ribbon */}
      <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs font-mono text-slate-400">
        {hoveredCandle ? (
          <div className="flex items-center gap-4 flex-wrap">
            <span>T: <strong className="text-white">{new Date(hoveredCandle.time).toLocaleTimeString()}</strong></span>
            <span>O: <strong className="text-white">${hoveredCandle.open}</strong></span>
            <span>H: <strong className="text-emerald-400">${hoveredCandle.high}</strong></span>
            <span>L: <strong className="text-rose-400">${hoveredCandle.low}</strong></span>
            <span>C: <strong className="text-white">${hoveredCandle.close}</strong></span>
            <span>Vol: <strong className="text-amber-400">{hoveredCandle.volume.toLocaleString()}</strong></span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span>Hover cursor over candles to inspect OHLCV data</span>
            {indicators && (
              <span className="text-emerald-400">
                • Current RSI: <strong>{indicators.rsi}</strong> ({indicators.rsi < 35 ? 'Oversold' : indicators.rsi > 65 ? 'Overbought' : 'Neutral'})
              </span>
            )}
          </div>
        )}

        {indicators && (
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-cyan-400">EMA9: ${indicators.ema9}</span>
            <span className="text-amber-400">EMA21: ${indicators.ema21}</span>
            <span className="text-purple-400">VWAP: ${indicators.vwap}</span>
          </div>
        )}
      </div>

      {/* Main Chart Canvas */}
      <div 
        ref={containerRef} 
        className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-white/10 bg-[#080b11] shadow-2xl"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-[#080b11]/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Streaming Bybit K-Lines...</span>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair"
        />
      </div>

      {/* Technical Indicators Deep Dive Summary Bar */}
      {indicators && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-400 text-[10px] block">Bollinger Squeeze</span>
            <span className={`font-bold text-sm ${indicators.bollinger.squeeze ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
              {indicators.bollinger.squeeze ? '⚠️ SQUEEZE DETECTED' : `${indicators.bollinger.bandwidth}% Normal`}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-400 text-[10px] block">Orderbook Imbalance</span>
            <span className={`font-bold text-sm ${indicators.orderbookImbalance > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {indicators.orderbookImbalance > 0 ? `+${indicators.orderbookImbalance}% BUY BIAS` : `${indicators.orderbookImbalance}% SELL BIAS`}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-400 text-[10px] block">MACD Signal Cross</span>
            <span className={`font-bold text-sm ${indicators.macd.cross === 'BULLISH' ? 'text-emerald-400' : indicators.macd.cross === 'BEARISH' ? 'text-rose-400' : 'text-slate-400'}`}>
              {indicators.macd.cross} ({indicators.macd.histogram})
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
            <span className="text-slate-400 text-[10px] block">Liquidation Cascade Risk</span>
            <span className={`font-bold text-sm ${indicators.liquidationRisk === 'EXTREME' ? 'text-rose-500 animate-pulse' : indicators.liquidationRisk === 'HIGH' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {indicators.liquidationRisk}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
