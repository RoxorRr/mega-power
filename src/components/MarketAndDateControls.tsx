/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MarketData, MarketRegime } from '../types/lottery';
import { MARKET_PRESETS } from '../utils/marketService';
import { getNextDrawDate } from '../utils/lotteryEngine';
import { TrendingUp, TrendingDown, Calendar, Activity, BarChart3, Clock } from 'lucide-react';

interface MarketAndDateControlsProps {
  market: MarketData;
  onMarketChange: (data: MarketData) => void;
  drawDate: string;
  onDrawDateChange: (dateStr: string) => void;
}

export const MarketAndDateControls: React.FC<MarketAndDateControlsProps> = ({
  market,
  onMarketChange,
  drawDate,
  onDrawDateChange,
}) => {
  const setNextDraw = (game: 'megamillions' | 'powerball') => {
    const nextDate = getNextDrawDate(game);
    onDrawDateChange(nextDate.toISOString().split('T')[0]);
  };

  const setToday = () => {
    onDrawDateChange(new Date().toISOString().split('T')[0]);
  };

  const handleRegimeChange = (regime: MarketRegime) => {
    const preset = MARKET_PRESETS.find((p) => p.regime === regime);
    if (preset) {
      onMarketChange(preset.data);
    }
  };

  // Formatted date string for human readability
  const formattedDate = (() => {
    try {
      const [year, month, day] = drawDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return drawDate;
    }
  })();

  return (
    <div id="wall-street" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Date of Draw Section (4 cols on lg) */}
      <div className="lg:col-span-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800/80">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Date of the Draw</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Chronological planetary harmonics and calendar cycles anchored to the draw evening.
          </p>

          <div className="mt-4">
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Draw Calendar Date
            </label>
            <input
              type="date"
              value={drawDate}
              onChange={(e) => onDrawDateChange(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500/50 font-mono-tabular"
            />
            <div className="mt-2 text-xs font-medium text-amber-300/90 font-mono-tabular">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="mt-5 pt-3 border-t border-neutral-800/60 space-y-1.5">
          <span className="text-[11px] text-neutral-500 block mb-1">Official Draw Schedule Shortcuts:</span>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setNextDraw('megamillions')}
              className="w-full text-left px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800/80 rounded text-xs text-neutral-300 hover:text-white transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Next Mega Millions (Tue/Fri)</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-mono-tabular">11:00 PM ET</span>
            </button>

            <button
              type="button"
              onClick={() => setNextDraw('powerball')}
              className="w-full text-left px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800/80 rounded text-xs text-neutral-300 hover:text-white transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-red-400" />
                <span>Next Powerball (Mon/Wed/Sat)</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-mono-tabular">10:59 PM ET</span>
            </button>

            <button
              type="button"
              onClick={setToday}
              className="text-left px-3 py-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Set to Today
            </button>
          </div>
        </div>
      </div>

      {/* Stock Market Performance Section (8 cols on lg) */}
      <div className="lg:col-span-8 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">Stock Market Performance on Draw Day</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Liquidity momentum, risk sentiment, and market volatility index (VIX) harmonic bias.
            </p>
          </div>

          {/* Market Regime Presets */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleRegimeChange('bull')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                market.regime === 'bull'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Bull Rally
            </button>
            <button
              type="button"
              onClick={() => handleRegimeChange('bear')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                market.regime === 'bear'
                  ? 'bg-red-950 text-red-300 border border-red-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Bear Selloff
            </button>
            <button
              type="button"
              onClick={() => handleRegimeChange('volatile')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                market.regime === 'volatile'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              High Volatility
            </button>
            <button
              type="button"
              onClick={() => handleRegimeChange('neutral')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                market.regime === 'neutral'
                  ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sideways
            </button>
          </div>
        </div>

        {/* Major Indices Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* S&P 500 */}
          <div className="bg-neutral-950/80 p-3.5 rounded-lg border border-neutral-800/90">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-white">S&P 500</span>
              <span className="font-mono-tabular text-[11px] text-neutral-500">{market.sp500Level.toFixed(1)}</span>
            </div>
            <div className={`mt-2 flex items-center gap-1 font-mono-tabular text-lg font-bold ${
              market.sp500ChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {market.sp500ChangePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{market.sp500ChangePercent >= 0 ? '+' : ''}{market.sp500ChangePercent.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.05}
              value={market.sp500ChangePercent}
              onChange={(e) => onMarketChange({ ...market, sp500ChangePercent: parseFloat(e.target.value) })}
              className="mt-2.5 w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Dow Jones */}
          <div className="bg-neutral-950/80 p-3.5 rounded-lg border border-neutral-800/90">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-white">Dow Jones</span>
              <span className="font-mono-tabular text-[11px] text-neutral-500">{market.dowLevel.toFixed(0)}</span>
            </div>
            <div className={`mt-2 flex items-center gap-1 font-mono-tabular text-lg font-bold ${
              market.dowChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {market.dowChangePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{market.dowChangePercent >= 0 ? '+' : ''}{market.dowChangePercent.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.05}
              value={market.dowChangePercent}
              onChange={(e) => onMarketChange({ ...market, dowChangePercent: parseFloat(e.target.value) })}
              className="mt-2.5 w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Nasdaq */}
          <div className="bg-neutral-950/80 p-3.5 rounded-lg border border-neutral-800/90">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-white">Nasdaq Comp.</span>
              <span className="font-mono-tabular text-[11px] text-neutral-500">{market.nasdaqLevel.toFixed(0)}</span>
            </div>
            <div className={`mt-2 flex items-center gap-1 font-mono-tabular text-lg font-bold ${
              market.nasdaqChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {market.nasdaqChangePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{market.nasdaqChangePercent >= 0 ? '+' : ''}{market.nasdaqChangePercent.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={0.05}
              value={market.nasdaqChangePercent}
              onChange={(e) => onMarketChange({ ...market, nasdaqChangePercent: parseFloat(e.target.value) })}
              className="mt-2.5 w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* VIX Volatility */}
          <div className="bg-neutral-950/80 p-3.5 rounded-lg border border-neutral-800/90">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-white">VIX Index</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-2 flex items-center gap-1 font-mono-tabular text-lg font-bold text-amber-300">
              <span>{market.vix.toFixed(1)}</span>
              <span className="text-[10px] font-normal text-neutral-500">
                {market.vix < 15 ? 'Calm' : market.vix > 25 ? 'High Vol' : 'Normal'}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={45}
              step={0.5}
              value={market.vix}
              onChange={(e) => onMarketChange({ ...market, vix: parseFloat(e.target.value) })}
              className="mt-2.5 w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Market Bias Impact:</span>
            <span className="text-neutral-300 font-medium">
              {market.sp500ChangePercent > 0.5 
                ? 'High liquidity momentum; upper tier number resonance elevated' 
                : market.sp500ChangePercent < -0.5 
                ? 'Bearish contraction; gravitational pull toward lower baseline cluster' 
                : 'Neutral consolidation; uniform distribution across standard variance'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
