/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Vault, Calculator, Sliders } from 'lucide-react';

interface HeaderProps {
  onOpenVault: () => void;
  onOpenWealthCalculator: () => void;
  onOpenOfficialDraws: () => void;
  onOpenCalibrator: () => void;
  onTriggerGenerate: () => void;
  vaultCount: number;
  isCalibrated: boolean;
  calibratedDrawCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVault,
  onOpenWealthCalculator,
  onOpenOfficialDraws,
  onOpenCalibrator,
  onTriggerGenerate,
  vaultCount,
  isCalibrated,
  calibratedDrawCount,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a 
          href="/" 
          className="text-xl font-bold tracking-tight text-white font-serif-display bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
        >
          AuraBall
        </a>

        {/* Zone 2: clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-neutral-400">
          <a href="#games-overview" className="hover:text-amber-300 transition-colors">
            Games
          </a>
          <button
            type="button"
            onClick={onOpenOfficialDraws}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real Draws</span>
          </button>
          <button
            type="button"
            onClick={onOpenCalibrator}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors text-left"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Calibrate Algorithm</span>
            {isCalibrated && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-tabular font-bold">
                {calibratedDrawCount}
              </span>
            )}
          </button>
          <a href="#environmental-tuning" className="hover:text-amber-300 transition-colors">
            Atmosphere
          </a>
          <a href="#wall-street" className="hover:text-amber-300 transition-colors">
            Wall Street
          </a>
          <button 
            type="button"
            onClick={onOpenWealthCalculator}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors text-left"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Wealth Payout</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenVault}
            className="relative px-3.5 py-1.5 text-xs font-semibold text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-md hover:border-neutral-700 hover:text-white transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Vault className="w-3.5 h-3.5 text-neutral-400" />
            <span>Ticket Vault</span>
            {vaultCount > 0 && (
              <span className="font-mono-tabular text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                {vaultCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onTriggerGenerate}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-md shadow-md shadow-amber-500/10 transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
            <span>Draw Numbers</span>
          </button>
        </div>
      </div>
    </header>
  );
};
