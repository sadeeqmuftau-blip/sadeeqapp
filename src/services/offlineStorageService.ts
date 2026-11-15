import { RapidMovementSignal, TickerData } from '../types/crypto';

export interface MarketSnapshot {
  timestamp: number;
  tickers: Record<string, TickerData>;
  signals: RapidMovementSignal[];
  cachedDateStr: string;
}

export class OfflineStorageService {
  private static readonly SNAPSHOT_KEY = 'crypto_radar_last_snapshot';

  /**
   * Save market snapshot to persistent local storage
   */
  public static saveSnapshot(tickers: Map<string, TickerData>, signals: RapidMovementSignal[]) {
    try {
      const obj: Record<string, TickerData> = {};
      tickers.forEach((val, key) => {
        obj[key] = val;
      });

      const snapshot: MarketSnapshot = {
        timestamp: Date.now(),
        tickers: obj,
        signals,
        cachedDateStr: new Date().toLocaleTimeString()
      };

      localStorage.setItem(this.SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch {
      // quota or private browsing safeguard
    }
  }

  /**
   * Retrieve cached snapshot when offline
   */
  public static getCachedSnapshot(): MarketSnapshot | null {
    try {
      const raw = localStorage.getItem(this.SNAPSHOT_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return null;
  }
}
