import { RapidMovementSignal } from '../types/crypto';

export interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'gem' | 'profit' | 'system';
  timestamp: number;
}

export class NotificationService {
  private static toastListeners: Set<(toasts: ToastAlert[]) => void> = new Set();
  private static activeToasts: ToastAlert[] = [];

  public static subscribeToasts(listener: (toasts: ToastAlert[]) => void): () => void {
    this.toastListeners.add(listener);
    listener([...this.activeToasts]);
    return () => this.toastListeners.delete(listener);
  }

  public static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  public static isPermissionGranted(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }

  /**
   * Push alert to browser notifications, mobile vibration, and in-app toast
   */
  public static triggerSignalAlert(signal: RapidMovementSignal, enableVibration: boolean = true) {
    const title = `🚨 [${signal.direction}] ${signal.symbol} RAPID MOVEMENT!`;
    const body = `${signal.breakoutProbability}% Conviction • Vol Spike: ${signal.volumeSurgeMultiple.toFixed(1)}x • Entry: $${signal.entryPrice} • Target: $${signal.target2}`;

    // 1. Mobile Vibration API
    if (enableVibration && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([120, 80, 120]);
      } catch {
        // ignore
      }
    }

    // 2. Native Browser Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/manifest.json',
          tag: signal.id,
          requireInteraction: false
        });
      } catch {
        // ignore
      }
    }

    // 3. In-App Floating Volatility Toast
    this.pushToast({
      id: signal.id,
      title,
      message: `${signal.triggerReason} (Entry $${signal.entryPrice} | SL $${signal.stopLoss})`,
      type: signal.isGem ? 'gem' : 'urgent',
      timestamp: Date.now()
    });
  }

  public static pushToast(toast: ToastAlert) {
    this.activeToasts.unshift(toast);
    if (this.activeToasts.length > 5) {
      this.activeToasts.pop();
    }
    this.notifyToasts();

    // Auto dismiss after 6.5 seconds
    setTimeout(() => {
      this.dismissToast(toast.id);
    }, 6500);
  }

  public static dismissToast(id: string) {
    this.activeToasts = this.activeToasts.filter(t => t.id !== id);
    this.notifyToasts();
  }

  private static notifyToasts() {
    const list = [...this.activeToasts];
    this.toastListeners.forEach(listener => listener(list));
  }
}
