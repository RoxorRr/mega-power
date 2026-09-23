/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlgorithmCalibrationProfile, 
  CalibrationDrawEntry, 
  OfficialDrawResult 
} from '../types/lottery';
import { LotteryBall } from './LotteryBall';
import { 
  Sliders, 
  X, 
  Sparkles, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Flame, 
  Coins, 
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { VERIFIED_RECENT_DRAWS } from '../services/realLotteryService';

interface AlgorithmCalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  calibration: AlgorithmCalibrationProfile;
  onAddCalibrationDraw: (draw: Omit<CalibrationDrawEntry, 'id' | 'addedAt'>) => void;
  onRemoveCalibrationDraw: (id: string) => void;
  onResetCalibration: () => void;
  onTriggerGenerate: () => void;
}

export const AlgorithmCalibratorModal: React.FC<AlgorithmCalibratorModalProps> = ({
  isOpen,
  onClose,
  calibration,
  onAddCalibrationDraw,
  onRemoveCalibrationDraw,
  onResetCalibration,
  onTriggerGenerate,
}) => {
  const [activeTab, setActiveTab] = useState<'official' | 'manual'>('official');
  const [manualGame, setManualGame] = useState<'megamillions' | 'powerball'>('powerball');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Manual inputs
  const [wb1, setWb1] = useState<string>('');
  const [wb2, setWb2] = useState<string>('');
  const [wb3, setWb3] = useState<string>('');
  const [wb4, setWb4] = useState<string>('');
  const [wb5, setWb5] = useState<string>('');
  const [bonus, setBonus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isCalibrated = calibration.totalDrawsTrained > 0;

  // Handle manual winning numbers submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const balls = [
      parseInt(wb1, 10),
      parseInt(wb2, 10),
      parseInt(wb3, 10),
      parseInt(wb4, 10),
      parseInt(wb5, 10),
    ];
    const bonusNum = parseInt(bonus, 10);

    const maxWhite = manualGame === 'powerball' ? 69 : 70;
    const maxBonus = manualGame === 'powerball' ? 26 : 25;

    // Validation
    for (const b of balls) {
      if (isNaN(b) || b < 1 || b > maxWhite) {
        setErrorMessage(`Each white ball must be a number between 1 and ${maxWhite}.`);
        return;
      }
    }

    const uniqueSet = new Set(balls);
    if (uniqueSet.size !== 5) {
      setErrorMessage('White balls cannot contain duplicates. Please enter 5 distinct numbers.');
      return;
    }

    if (isNaN(bonusNum) || bonusNum < 1 || bonusNum > maxBonus) {
      setErrorMessage(`Bonus ball (${manualGame === 'powerball' ? 'Powerball' : 'Mega Ball'}) must be between 1 and ${maxBonus}.`);
      return;
    }

    // Sort ascending
    balls.sort((a, b) => a - b);

    onAddCalibrationDraw({
      game: manualGame,
      drawDate: manualDate || new Date().toISOString().split('T')[0],
      whiteBalls: balls,
      bonusBall: bonusNum,
      source: 'User Manual Draw Feedback',
    });

    // Reset inputs
    setWb1('');
    setWb2('');
    setWb3('');
    setWb4('');
    setWb5('');
    setBonus('');
    setSuccessNotice(`Calibrated! Added ${manualGame === 'powerball' ? 'Powerball' : 'Mega Millions'} draw (${balls.join(', ')} + ${bonusNum}).`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // One-click add from verified official draws
  const handleAddOfficialDraw = (draw: OfficialDrawResult) => {
    const isAlreadyAdded = calibration.history.some(
      (h) => h.game === draw.game && h.drawDate === draw.drawDate
    );
    if (isAlreadyAdded) {
      setErrorMessage(`This draw (${draw.drawDate}) is already in your calibration model.`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    onAddCalibrationDraw({
      game: draw.game,
      drawDate: draw.drawDate,
      whiteBalls: draw.whiteBalls,
      bonusBall: draw.bonusBall,
      source: draw.source,
    });

    setSuccessNotice(`Learned official ${draw.drawDate} draw! Biases updated.`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-serif-display">
                  Algorithm Recalibration & Draw Feedback Loop
                </h3>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border flex items-center gap-1 ${
                  isCalibrated
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isCalibrated ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                  {isCalibrated ? `${calibration.totalDrawsTrained} Draws Learned` : 'Factory Baseline'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Didn't win? Feed back the actual winning numbers to tune thermal buoyancy, chamber turbulence, and decile dispersion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCalibrated && (
              <button
                type="button"
                onClick={onResetCalibration}
                className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Reset to pure theoretical physics baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Baseline</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notices */}
        {errorMessage && (
          <div className="px-6 py-2 bg-red-950/40 border-b border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successNotice && (
          <div className="px-6 py-2 bg-emerald-950/40 border-b border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Calibration Diagnostics Matrix */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Algorithmic Correction Multipliers
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono-tabular">
                Status: {calibration.lastUpdated}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  Low Decile (1-25)
                </span>
                <span className={`text-base font-bold font-mono-tabular ${
                  calibration.lowDecileOffset > 0 ? 'text-emerald-400' : calibration.lowDecileOffset < 0 ? 'text-amber-400' : 'text-neutral-400'
                }`}>
                  {calibration.lowDecileOffset >= 0 ? '+' : ''}{(calibration.lowDecileOffset * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-neutral-500 block">Thermal buoyancy lift</span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  Mid Decile (26-50)
                </span>
                <span className={`text-base font-bold font-mono-tabular ${
                  calibration.midDecileOffset > 0 ? 'text-emerald-400' : calibration.midDecileOffset < 0 ? 'text-amber-400' : 'text-neutral-400'
                }`}>
                  {calibration.midDecileOffset >= 0 ? '+' : ''}{(calibration.midDecileOffset * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-neutral-500 block">Barometric equilibrium</span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  High Decile (51-70)
                </span>
                <span className={`text-base font-bold font-mono-tabular ${
                  calibration.highDecileOffset > 0 ? 'text-emerald-400' : calibration.highDecileOffset < 0 ? 'text-amber-400' : 'text-neutral-400'
                }`}>
                  {calibration.highDecileOffset >= 0 ? '+' : ''}{(calibration.highDecileOffset * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-neutral-500 block">Kinetic ceiling dampening</span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  Parity (Odd/Even)
                </span>
                <span className={`text-base font-bold font-mono-tabular ${
                  calibration.oddParityFactor > 0 ? 'text-emerald-400' : calibration.oddParityFactor < 0 ? 'text-amber-400' : 'text-neutral-400'
                }`}>
                  {calibration.oddParityFactor >= 0 ? '+' : ''}{(calibration.oddParityFactor * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-neutral-500 block">Odd-number vector drift</span>
              </div>
            </div>

            {/* Ball Affinities Pill Bar */}
            {isCalibrated && Object.keys(calibration.frequencyResiduals).length > 0 && (
              <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] text-neutral-400 uppercase font-bold mr-1">
                  Empirical Ball Boosts:
                </span>
                {Object.entries(calibration.frequencyResiduals)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([ballStr, boost]) => (
                    <span 
                      key={`freq-${ballStr}`}
                      className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono-tabular text-[11px] font-bold"
                    >
                      #{ballStr} (+{(boost * 100).toFixed(0)}%)
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setActiveTab('official')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'official'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Ingest Official Draws (NY Open Data)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'manual'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Input My Specific Losing Game Numbers</span>
            </button>
          </div>

          {/* Tab 1: Official Recent Draws Ingestion */}
          {activeTab === 'official' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">
                  Select Recent Official Draws to Calibrate Against:
                </span>
                <span className="text-[11px] text-neutral-500">
                  Click any draw to train the physics model
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {VERIFIED_RECENT_DRAWS.map((draw) => {
                  const isAdded = calibration.history.some(
                    (h) => h.game === draw.game && h.drawDate === draw.drawDate
                  );
                  return (
                    <div
                      key={draw.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isAdded
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`font-bold flex items-center gap-1 ${
                            draw.game === 'powerball' ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            {draw.game === 'powerball' ? (
                              <Flame className="w-3 h-3" />
                            ) : (
                              <Coins className="w-3 h-3" />
                            )}
                            {draw.game === 'powerball' ? 'Powerball' : 'Mega Millions'}
                          </span>
                          <span className="text-neutral-500">·</span>
                          <span className="text-neutral-300 font-mono-tabular">{draw.drawDate}</span>
                        </div>

                        {/* Balls */}
                        <div className="flex items-center gap-1.5 mt-2">
                          {draw.whiteBalls.map((b) => (
                            <span
                              key={`draw-pill-${draw.id}-${b}`}
                              className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-[10px] font-bold font-mono-tabular flex items-center justify-center"
                            >
                              {b}
                            </span>
                          ))}
                          <span className={`w-6 h-6 rounded-full border text-[10px] font-bold font-mono-tabular flex items-center justify-center ${
                            draw.game === 'powerball'
                              ? 'bg-red-500/20 border-red-500/40 text-red-300'
                              : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          }`}>
                            {draw.bonusBall}
                          </span>
                        </div>
                      </div>

                      {isAdded ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Trained</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddOfficialDraw(draw)}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/40 text-xs font-semibold text-neutral-200 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3 h-3 text-amber-400" />
                          <span>Calibrate</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Manual Winning Numbers Input */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Game select */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Which Lottery Did You Play?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setManualGame('powerball')}
                      className={`p-2 rounded-lg border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                        manualGame === 'powerball'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Powerball</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setManualGame('megamillions')}
                      className={`p-2 rounded-lg border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                        manualGame === 'megamillions'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Mega Millions</span>
                    </button>
                  </div>
                </div>

                {/* Draw Date */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Drawing Date:
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Number Inputs */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Enter The Actual Winning Numbers from the Drawing:
                </label>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="W1"
                      min={1}
                      max={manualGame === 'powerball' ? 69 : 70}
                      value={wb1}
                      onChange={(e) => setWb1(e.target.value)}
                      className="w-12 h-12 text-center text-sm font-bold font-mono-tabular bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="number"
                      placeholder="W2"
                      min={1}
                      max={manualGame === 'powerball' ? 69 : 70}
                      value={wb2}
                      onChange={(e) => setWb2(e.target.value)}
                      className="w-12 h-12 text-center text-sm font-bold font-mono-tabular bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="number"
                      placeholder="W3"
                      min={1}
                      max={manualGame === 'powerball' ? 69 : 70}
                      value={wb3}
                      onChange={(e) => setWb3(e.target.value)}
                      className="w-12 h-12 text-center text-sm font-bold font-mono-tabular bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="number"
                      placeholder="W4"
                      min={1}
                      max={manualGame === 'powerball' ? 69 : 70}
                      value={wb4}
                      onChange={(e) => setWb4(e.target.value)}
                      className="w-12 h-12 text-center text-sm font-bold font-mono-tabular bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="number"
                      placeholder="W5"
                      min={1}
                      max={manualGame === 'powerball' ? 69 : 70}
                      value={wb5}
                      onChange={(e) => setWb5(e.target.value)}
                      className="w-12 h-12 text-center text-sm font-bold font-mono-tabular bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <span className="text-neutral-500 font-bold px-1">+</span>

                  {/* Bonus */}
                  <div>
                    <input
                      type="number"
                      placeholder={manualGame === 'powerball' ? 'PB' : 'MB'}
                      min={1}
                      max={manualGame === 'powerball' ? 26 : 25}
                      value={bonus}
                      onChange={(e) => setBonus(e.target.value)}
                      className={`w-12 h-12 text-center text-sm font-bold font-mono-tabular bg-neutral-900 border rounded-xl focus:outline-none ${
                        manualGame === 'powerball'
                          ? 'border-red-500/60 text-red-400 focus:border-red-400'
                          : 'border-amber-500/60 text-amber-400 focus:border-amber-400'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="ml-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Train Algorithm</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Training Corpus History */}
          {calibration.history.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">
                  Active Training Corpus ({calibration.history.length} Draws Ingested):
                </span>
                <span className="text-[11px] text-neutral-500">
                  Hover to inspect or remove individual draws
                </span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {calibration.history.map((entry) => (
                  <div
                    key={entry.id}
                    className="px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-bold uppercase text-[10px] ${
                        entry.game === 'powerball' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {entry.game === 'powerball' ? 'Powerball' : 'Mega Millions'}
                      </span>
                      <span className="text-neutral-500">·</span>
                      <span className="font-mono-tabular text-neutral-300">{entry.drawDate}</span>
                      <span className="text-neutral-500">·</span>
                      <span className="font-mono-tabular text-white font-medium">
                        {entry.whiteBalls.map(n => n < 10 ? `0${n}` : n).join(' ')} + 
                        <strong className={`ml-1 ${entry.game === 'powerball' ? 'text-red-400' : 'text-amber-400'}`}>
                          {entry.bonusBall < 10 ? `0${entry.bonusBall}` : entry.bonusBall}
                        </strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveCalibrationDraw(entry.id)}
                      className="text-neutral-600 hover:text-red-400 p-1 transition-colors"
                      title="Remove this draw from training set"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Educational Note */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-[11px] text-neutral-400 leading-relaxed space-y-1">
            <span className="font-bold text-neutral-300 block">How Algorithm Recalibration Works:</span>
            <p>
              In real-world Halogen / Criterion blower chambers, micro-tolerances in ball surface friction, ambient barometric pressure, and thermal vortex air currents introduce subtle empirical drift. 
              When you feed back actual winning combinations, our deterministic engine calculates the residual error vectors and recalibrates decile weights, parity momentum, and resonant ball affinities without destroying underlying physics.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {isCalibrated 
                ? 'All subsequent generated tickets will use your calibrated bias matrix.' 
                : 'Currently running on default atmospheric & market physics.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onTriggerGenerate();
                onClose();
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Generate with Calibrated Algorithm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
