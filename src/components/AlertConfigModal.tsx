import React, { useState } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  Volume2, 
  Bell, 
  Vibrate, 
  ShieldCheck, 
  Play, 
  Check,
  Flame,
  Sparkles
} from 'lucide-react';
import { AlertFilterConfig, RapidMovementSignal } from '../types/crypto';
import { AlertAudioService } from '../services/audioService';
import { NotificationService } from '../services/notificationService';

interface AlertConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertFilterConfig;
  onSaveConfig: (newConfig: AlertFilterConfig) => void;
  onTriggerTestAlert: () => void;
}

export const AlertConfigModal: React.FC<AlertConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTriggerTestAlert
}) => {
  const [form, setForm] = useState<AlertFilterConfig>({ ...config });

  if (!isOpen) return null;

  const handleTestSound = (sound: AlertFilterConfig['alertSound']) => {
    AlertAudioService.playAlert(sound);
  };

  const handleRequestPush = async () => {
    const granted = await NotificationService.requestPermission();
    setForm(p => ({ ...p, enableBrowserPush: granted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b0f19] border border-white/10 p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Alert Radar Filters</h3>
              <p className="text-xs text-slate-400">
                Custom triggers for volume spikes and imminent breakouts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Minimum Volume Surge */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Min Volume Spike Multiple</span>
              <span className="text-emerald-400 font-bold">{form.minVolumeSpike}x Over 20-SMA</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="5.0"
              step="0.5"
              value={form.minVolumeSpike}
              onChange={(e) => setForm({ ...form, minVolumeSpike: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Minimum Momentum Score */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Minimum Conviction / Momentum Score</span>
              <span className="text-cyan-400 font-bold">{form.minMomentumScore} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={form.minMomentumScore}
              onChange={(e) => setForm({ ...form, minMomentumScore: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Direction Filter */}
          <div>
            <label className="text-slate-400 block mb-1">Trade Direction Filter</label>
            <div className="grid grid-cols-3 gap-2">
              {(['ALL', 'LONG', 'SHORT'] as const).map(dir => (
                <button
                  type="button"
                  key={dir}
                  onClick={() => setForm({ ...form, directionFilter: dir })}
                  className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                    form.directionFilter === dir
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>

          {/* Hidden Gems Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-white font-bold block text-xs">Only Hidden Gems</span>
                <span className="text-[11px] text-slate-400">Filter exclusively low-cap high-beta tokens</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.onlyGems}
              onChange={(e) => setForm({ ...form, onlyGems: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Alert Sound Preset */}
          <div>
            <label className="text-slate-400 block mb-1">Alert Sound Synth</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['radar', 'sonar', 'bleep', 'synth'] as const).map(snd => (
                <button
                  type="button"
                  key={snd}
                  onClick={() => {
                    setForm({ ...form, alertSound: snd });
                    handleTestSound(snd);
                  }}
                  className={`p-2 rounded-xl border text-xs font-mono capitalize flex items-center justify-center gap-1.5 transition-all ${
                    form.alertSound === snd
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{snd}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Vibration & Native Push */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleRequestPush}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                form.enableBrowserPush
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{form.enableBrowserPush ? 'Push Active' : 'Request Push'}</span>
            </button>

            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, enableVibration: !p.enableVibration }))}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                form.enableVibration
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                  : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Vibrate className="w-4 h-4" />
              <span>{form.enableVibration ? 'Vibration ON' : 'Vibration OFF'}</span>
            </button>
          </div>

          {/* Test Alert Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onTriggerTestAlert}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Instant "Rapid Movement" Alert</span>
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save Radar Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
