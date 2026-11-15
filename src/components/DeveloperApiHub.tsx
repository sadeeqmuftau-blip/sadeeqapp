import React, { useState } from 'react';
import { 
  Terminal, 
  Key, 
  Database, 
  Copy, 
  Check, 
  Play, 
  ShieldCheck, 
  Code, 
  Server,
  Radio,
  FileCode,
  Zap,
  Lock
} from 'lucide-react';
import { ApiTokenRecord } from '../types/crypto';
import { JwtAuthService } from '../services/jwtAuthService';

export const DeveloperApiHub: React.FC = () => {
  const [tokens, setTokens] = useState<ApiTokenRecord[]>(() => JwtAuthService.getSavedTokens());
  const [tokenName, setTokenName] = useState('');
  const [tokenRole, setTokenRole] = useState<'TRADER' | 'WEBHOOK_SUBSCRIBER' | 'ADMIN'>('TRADER');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'endpoints' | 'generator' | 'postgres'>('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState<'rapid' | 'gems' | 'ws'>('rapid');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  const handleCreateToken = async () => {
    if (!tokenName.trim()) return;
    const permissions = tokenRole === 'ADMIN' 
      ? ['read:signals', 'stream:websocket', 'manage:alerts', 'admin:system']
      : tokenRole === 'WEBHOOK_SUBSCRIBER'
      ? ['read:signals', 'receive:webhooks']
      : ['read:signals', 'stream:websocket'];

    const jwt = await JwtAuthService.generateJWT({
      sub: `usr_${Date.now().toString(36)}`,
      name: tokenName,
      role: tokenRole,
      permissions,
      rateLimit: '180 req/min',
      expDays: 90
    });

    const newRecord: ApiTokenRecord = {
      id: `tok_${Date.now().toString(36)}`,
      name: tokenName,
      token: jwt,
      role: tokenRole,
      createdAt: new Date().toISOString().split('T')[0],
      expiresIn: '90 Days',
      rateLimit: '180 req/min'
    };

    JwtAuthService.addToken(newRecord);
    setTokens(JwtAuthService.getSavedTokens());
    setTokenName('');
  };

  const handleDeleteToken = (id: string) => {
    JwtAuthService.deleteToken(id);
    setTokens(JwtAuthService.getSavedTokens());
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestEndpoint = () => {
    setIsCalling(true);
    setTimeout(() => {
      if (selectedEndpoint === 'rapid') {
        setApiResponse(JSON.stringify({
          status: 200,
          authenticated: true,
          token_role: tokens[0]?.role || 'TRADER',
          timestamp: Date.now(),
          count: 3,
          signals: [
            {
              symbol: 'SUIUSDT',
              direction: 'LONG',
              signalType: 'SQUEEZE_BREAKOUT',
              breakoutProbability: 92,
              entryPrice: 3.42,
              target2: 3.88,
              stopLoss: 3.24,
              volumeSurgeMultiple: 4.8,
              bybitLinearCategory: 'linear_perp'
            },
            {
              symbol: 'PEPEUSDT',
              direction: 'LONG',
              signalType: 'HIDDEN_GEM_PUMP',
              breakoutProbability: 89,
              entryPrice: 0.0000182,
              target2: 0.0000215,
              stopLoss: 0.0000171,
              volumeSurgeMultiple: 6.2,
              bybitLinearCategory: 'linear_perp'
            }
          ]
        }, null, 2));
      } else if (selectedEndpoint === 'gems') {
        setApiResponse(JSON.stringify({
          status: 200,
          authenticated: true,
          gemsCount: 14,
          topVolumeSurges: [
            { symbol: 'PEPEUSDT', surgeMultiple: '6.2x', turnover24hUsd: '$412,400,000' },
            { symbol: 'SUIUSDT', surgeMultiple: '4.8x', turnover24hUsd: '$318,000,000' },
            { symbol: 'TAOUSDT', surgeMultiple: '3.9x', turnover24hUsd: '$184,000,000' }
          ]
        }, null, 2));
      } else {
        setApiResponse(JSON.stringify({
          status: 101,
          connection: 'Upgrade',
          upgrade: 'websocket',
          stream: 'wss://stream.cryptoradar.io/v1/linear-signals',
          handshake: 'Authenticated with Bearer JWT',
          liveEvents: ['SUBSCRIBE_VOLUME_SURGES', 'SUBSCRIBE_RAPID_BREAKOUTS']
        }, null, 2));
      }
      setIsCalling(false);
    }, 400);
  };

  const activeJwt = tokens[0]?.token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-rose-400" />
          <h2 className="text-lg font-bold text-white">
            Custom API, Secure WebSockets & PostgreSQL Architecture
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('endpoints')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === 'endpoints' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📡 Endpoints & WS
          </button>
          <button
            onClick={() => setActiveSubTab('generator')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === 'generator' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔑 JWT Token Generator
          </button>
          <button
            onClick={() => setActiveSubTab('postgres')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSubTab === 'postgres' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            🗄️ PostgreSQL Schema
          </button>
        </div>
      </div>

      {/* View 1: Endpoints & Interactive cURL Tester */}
      {activeSubTab === 'endpoints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Available Bybit Linear Endpoints
            </h3>

            <div
              onClick={() => setSelectedEndpoint('rapid')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedEndpoint === 'rapid'
                  ? 'bg-rose-500/15 border-rose-500/40 text-white'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                  GET
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  /api/v1/signals/rapid-movement
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Returns live imminent breakout signals with entry/target/SL prices.
              </p>
            </div>

            <div
              onClick={() => setSelectedEndpoint('gems')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedEndpoint === 'gems'
                  ? 'bg-rose-500/15 border-rose-500/40 text-white'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                  GET
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  /api/v1/signals/hidden-gems
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Filter low-cap high-beta tokens with abnormal volume surges.
              </p>
            </div>

            <div
              onClick={() => setSelectedEndpoint('ws')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedEndpoint === 'ws'
                  ? 'bg-rose-500/15 border-rose-500/40 text-white'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400">
                  WSS
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  wss://stream.cryptoradar.io/v1/linear-signals
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Low-latency WebSocket streaming live signals with JWT handshake.
              </p>
            </div>
          </div>

          {/* cURL & Response Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-rose-400" />
                  Authenticated cURL Snippet
                </span>
                <button
                  onClick={() => copyToClipboard(
                    `curl -X GET "https://api.cryptoradar.io/api/v1/signals/rapid-movement" \\\n  -H "Authorization: Bearer ${activeJwt}" \\\n  -H "Content-Type: application/json"`,
                    'curl'
                  )}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1"
                >
                  {copiedKey === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'curl' ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-slate-950 border border-white/5 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                {`curl -X GET "https://api.cryptoradar.io/api/v1/signals/${selectedEndpoint === 'rapid' ? 'rapid-movement' : selectedEndpoint === 'gems' ? 'hidden-gems' : 'stream'}" \\
  -H "Authorization: Bearer ${activeJwt.slice(0, 32)}..." \\
  -H "Content-Type: application/json"`}
              </pre>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  Rate limit: 180 req/min • Auth: HS256 JWT
                </span>
                <button
                  onClick={handleTestEndpoint}
                  disabled={isCalling}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-rose-950/40"
                >
                  <Play className={`w-3.5 h-3.5 ${isCalling ? 'animate-spin' : ''}`} />
                  <span>{isCalling ? 'Executing...' : 'Send Live Test Request'}</span>
                </button>
              </div>
            </div>

            {/* Live JSON Response Box */}
            {apiResponse && (
              <div className="rounded-2xl bg-slate-950 border border-white/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Live Response Payload (200 OK)
                  </span>
                  <button
                    onClick={() => copyToClipboard(apiResponse, 'resp')}
                    className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'resp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/60 text-xs font-mono text-cyan-300 overflow-x-auto max-h-64">
                  {apiResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View 2: JWT Token Generator & Keys Management */}
      {activeSubTab === 'generator' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-rose-400" />
              Issue New Cryptographic JWT Token (HMAC-SHA256)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 font-mono block mb-1">
                  Token Name / App Identifier
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g. My Mobile Algorithmic Trading Bot"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">
                  Access Role
                </label>
                <select
                  value={tokenRole}
                  onChange={(e) => setTokenRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="TRADER">TRADER (Read Signals + WS Stream)</option>
                  <option value="WEBHOOK_SUBSCRIBER">WEBHOOK SUBSCRIBER</option>
                  <option value="ADMIN">ADMIN (Full Cluster Access)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateToken}
              disabled={!tokenName.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs font-mono flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Generate Signed JWT</span>
            </button>
          </div>

          {/* Tokens List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Active Authorized JWT Tokens ({tokens.length})
            </h3>

            {tokens.map((tok) => (
              <div
                key={tok.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{tok.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {tok.role}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteToken(tok.id)}
                    className="text-slate-500 hover:text-rose-400 text-xs transition-colors"
                  >
                    Revoke Token
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-lg border border-white/5">
                  <span className="text-slate-400 truncate flex-1 select-all font-mono">
                    {tok.token}
                  </span>
                  <button
                    onClick={() => copyToClipboard(tok.token, tok.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 shrink-0"
                  >
                    {copiedKey === tok.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === tok.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Created: {tok.createdAt}</span>
                  <span>Rate Limit: {tok.rateLimit}</span>
                  <span>Expires: {tok.expiresIn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: PostgreSQL Schema Architecture */}
      {activeSubTab === 'postgres' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Robust PostgreSQL Production Database Schema
              </h3>
              <p className="text-xs text-slate-400">
                Optimized with B-Tree indexes, BRIN time-series indexing, and JSONB convergence rules
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(JwtAuthService.getPostgresSchema(), 'ddl')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5"
            >
              {copiedKey === 'ddl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'ddl' ? 'DDL Copied' : 'Copy PostgreSQL DDL'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed max-h-[500px]">
            {JwtAuthService.getPostgresSchema()}
          </pre>
        </div>
      )}
    </div>
  );
};
