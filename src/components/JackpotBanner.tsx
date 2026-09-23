/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GAME_CONFIGS } from '../utils/lotteryEngine';
import { RealJackpotInfo } from '../types/lottery';
import { 
  Coins, 
  Flame, 
  ArrowRight, 
  History, 
  Radio, 
  Edit3, 
  Check, 
  Sparkles,
  TrendingUp,
  Sliders
} from 'lucide-react';

interface JackpotBannerProps {
  onSelectGame: (game: 'megamillions' | 'powerball' | 'both') => void;
  activeGame: 'megamillions' | 'powerball' | 'both';
  onOpenWealthCalculator: (game?: 'megamillions' | 'powerball') => void;
  onOpenOfficialDraws: () => void;
  onOpenCalibrator?: () => void;
  isCalibrated?: boolean;
  jackpots: Record<'megamillions' | 'powerball', RealJackpotInfo>;
  onUpdateJackpot: (game: 'megamillions' | 'powerball', amount: number) => void;
}

export const JackpotBanner: React.FC<JackpotBannerProps> = ({
  onSelectGame,
  activeGame,
  onOpenWealthCalculator,
  onOpenOfficialDraws,
  onOpenCalibrator,
  isCalibrated,
  jackpots,
  onUpdateJackpot,
}) => {
  const [editingGame, setEditingGame] = useState<'megamillions' | 'powerball' | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const mm = jackpots.megamillions;
  const pb = jackpots.powerball;

  const handleStartEdit = (game: 'megamillions' | 'powerball', e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGame(game);
    setEditValue((jackpots[game].advertisedAmount / 1_000_000).toString());
  };

  const handleSaveEdit = (game: 'megamillions' | 'powerball', e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const val = parseFloat(editValue);
    if (!isNaN(val) && val > 0) {
      onUpdateJackpot(game, Math.round(val * 1_000_000));
    }
    setEditingGame(null);
  };

  return (
    <div className="w-full border-b border-neutral-800/60 bg-gradient-to-b from-neutral-900/60 to-neutral-950/90 py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Real Live Jackpots Verified Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                Official Live Multi-State Jackpots
              </span>
              <span className="text-neutral-500 mx-2">·</span>
              <span className="text-neutral-400 font-mono-tabular">
                Powerball: <strong className="text-red-400">{pb.advertisedFormatted}</strong> | Mega Millions: <strong className="text-amber-400">{mm.advertisedFormatted}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenCalibrator && (
              <button
                type="button"
                onClick={onOpenCalibrator}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-500/40 rounded-lg text-xs font-semibold text-neutral-200 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Calibrate Algorithm</span>
                {isCalibrated && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onOpenOfficialDraws}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-neutral-600 rounded-lg text-xs font-semibold text-neutral-200 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Real Winning Numbers & Matches</span>
            </button>
          </div>
        </div>

        {/* Jackpot Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* Mega Millions Card */}
          <div 
            onClick={() => onSelectGame('megamillions')}
            className={`
              cursor-pointer rounded-xl p-5 border transition-all duration-200 relative overflow-hidden group
              ${activeGame === 'megamillions' || activeGame === 'both' 
                ? 'bg-gradient-to-br from-amber-950/20 via-neutral-900 to-neutral-900/90 border-amber-500/40 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30' 
                : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700'}
            `}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Mega Millions®</span>
                  <span className="text-neutral-500 font-normal">·</span>
                  <span className="text-neutral-400 normal-case font-normal">{mm.drawTime}</span>
                </div>
                
                {/* Jackpot Amount Display / Inline Edit */}
                {editingGame === 'megamillions' ? (
                  <form onSubmit={(e) => handleSaveEdit('megamillions', e)} className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-bold text-amber-400">$</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Jackpot Millions (e.g. 277)"
                      className="w-36 bg-neutral-950 border border-amber-500/60 rounded px-2.5 py-1 text-lg font-bold text-white font-mono-tabular focus:outline-none"
                      autoFocus
                    />
                    <span className="text-xs text-neutral-400 font-bold">Million</span>
                    <button
                      type="submit"
                      className="p-1 bg-amber-500 text-neutral-950 rounded hover:bg-amber-400"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono-tabular">
                      {mm.advertisedFormatted}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit('megamillions', e)}
                      className="p-1 text-neutral-600 hover:text-amber-400 rounded transition-colors"
                      title="Adjust real jackpot amount"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                <div className="mt-1 text-xs text-neutral-400 flex items-center gap-2 flex-wrap">
                  <span>Cash Lump Sum: <strong className="text-neutral-200 font-mono-tabular">{mm.cashFormatted}</strong></span>
                  <span className="text-neutral-600">·</span>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWealthCalculator('megamillions');
                    }}
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 font-medium"
                  >
                    After Taxes <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded transition-colors ${
                  activeGame === 'megamillions' || activeGame === 'both'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  5 White (1-70) + 1 Gold (1-25)
                </span>
                <span className="text-[11px] text-neutral-500 mt-2">Next: {mm.nextDrawDate}</span>
              </div>
            </div>
          </div>

          {/* Powerball Card */}
          <div 
            onClick={() => onSelectGame('powerball')}
            className={`
              cursor-pointer rounded-xl p-5 border transition-all duration-200 relative overflow-hidden group
              ${activeGame === 'powerball' || activeGame === 'both' 
                ? 'bg-gradient-to-br from-red-950/20 via-neutral-900 to-neutral-900/90 border-red-500/40 shadow-lg shadow-red-950/20 ring-1 ring-red-500/30' 
                : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700'}
            `}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-red-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Powerball®</span>
                  <span className="text-neutral-500 font-normal">·</span>
                  <span className="text-neutral-400 normal-case font-normal">{pb.drawTime}</span>
                </div>
                
                {/* Jackpot Amount Display / Inline Edit */}
                {editingGame === 'powerball' ? (
                  <form onSubmit={(e) => handleSaveEdit('powerball', e)} className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-bold text-red-400">$</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Jackpot Millions (e.g. 332)"
                      className="w-36 bg-neutral-950 border border-red-500/60 rounded px-2.5 py-1 text-lg font-bold text-white font-mono-tabular focus:outline-none"
                      autoFocus
                    />
                    <span className="text-xs text-neutral-400 font-bold">Million</span>
                    <button
                      type="submit"
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-400"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono-tabular">
                      {pb.advertisedFormatted}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleStartEdit('powerball', e)}
                      className="p-1 text-neutral-600 hover:text-red-400 rounded transition-colors"
                      title="Adjust real jackpot amount"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                <div className="mt-1 text-xs text-neutral-400 flex items-center gap-2 flex-wrap">
                  <span>Cash Lump Sum: <strong className="text-neutral-200 font-mono-tabular">{pb.cashFormatted}</strong></span>
                  <span className="text-neutral-600">·</span>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWealthCalculator('powerball');
                    }}
                    className="text-red-400 hover:text-red-300 underline underline-offset-2 flex items-center gap-1 font-medium"
                  >
                    After Taxes <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded transition-colors ${
                  activeGame === 'powerball' || activeGame === 'both'
                    ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  5 White (1-69) + 1 Red (1-26)
                </span>
                <span className="text-[11px] text-neutral-500 mt-2">Next: {pb.nextDrawDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

