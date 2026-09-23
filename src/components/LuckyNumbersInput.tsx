/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LuckyNumberSettings } from '../types/lottery';
import { Sparkles, X, Plus, Zap, Lock, RefreshCw } from 'lucide-react';

interface LuckyNumbersInputProps {
  settings: LuckyNumberSettings;
  onChange: (newSettings: LuckyNumberSettings) => void;
}

export const LuckyNumbersInput: React.FC<LuckyNumbersInputProps> = ({
  settings,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showQuickGrid, setShowQuickGrid] = useState(false);

  const addNumber = (num: number) => {
    if (num < 1 || num > 70) return;
    if (!settings.numbers.includes(num)) {
      const updated = [...settings.numbers, num].sort((a, b) => a - b);
      onChange({ ...settings, numbers: updated });
    }
  };

  const removeNumber = (num: number) => {
    onChange({
      ...settings,
      numbers: settings.numbers.filter((n) => n !== num),
    });
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Support comma, space, semicolon, tab separation
    const tokens = inputValue.split(/[\s,;]+/);
    const newNums = [...settings.numbers];

    for (const token of tokens) {
      const parsed = parseInt(token.trim(), 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 70 && !newNums.includes(parsed)) {
        newNums.push(parsed);
      }
    }

    newNums.sort((a, b) => a - b);
    onChange({ ...settings, numbers: newNums });
    setInputValue('');
  };

  const handleApplyPreset = (presetName: string) => {
    let presetNums: number[] = [];
    switch (presetName) {
      case 'fibonacci':
        presetNums = [1, 2, 3, 5, 8, 13, 21, 34, 55];
        break;
      case 'primes':
        presetNums = [3, 7, 11, 17, 23, 31, 41, 47];
        break;
      case 'classics':
        presetNums = [7, 11, 21, 33, 42, 59];
        break;
      case 'golden':
        presetNums = [16, 26, 42, 68];
        break;
      default:
        presetNums = [];
    }
    onChange({ ...settings, numbers: presetNums });
  };

  const clearAll = () => {
    onChange({ ...settings, numbers: [] });
  };

  return (
    <div id="lucky-numbers" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Your Lucky Numbers</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Inject your personal numerological signatures into the atmospheric lottery matrix.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onChange({ ...settings, mode: 'harmonic_weight' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              settings.mode === 'harmonic_weight'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Magnifies probability gravity without breaking random aerodynamic dispersion"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Harmonic Pull</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...settings, mode: 'anchor_lock' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              settings.mode === 'anchor_lock'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Directly secures lucky numbers into ticket lines, completing the rest via entropy"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Anchor Lock</span>
          </button>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="mt-4">
        <form onSubmit={handleInputSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter lucky numbers (e.g. 7, 11, 23, 42)..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 font-mono-tabular"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Presets & Quick Grid Toggles */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-neutral-500 text-[11px]">Presets:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('classics')}
              className="px-2 py-0.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] border border-neutral-700/60 transition-colors"
            >
              Classic Favourites (7, 11, 21...)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('fibonacci')}
              className="px-2 py-0.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] border border-neutral-700/60 transition-colors"
            >
              Fibonacci (1, 2, 3, 5, 8...)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('primes')}
              className="px-2 py-0.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] border border-neutral-700/60 transition-colors"
            >
              Primes (3, 7, 11, 17...)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('golden')}
              className="px-2 py-0.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] border border-neutral-700/60 transition-colors"
            >
              Golden Ratio
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuickGrid(!showQuickGrid)}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2"
            >
              {showQuickGrid ? 'Hide Quick Picker' : 'Pick from 1-70 Grid'}
            </button>
            {settings.numbers.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] text-neutral-400 hover:text-neutral-200"
              >
                Clear ({settings.numbers.length})
              </button>
            )}
          </div>
        </div>

        {/* Quick Number Grid (Expandable) */}
        {showQuickGrid && (
          <div className="mt-3 p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <div className="text-[11px] text-neutral-400 mb-2 font-medium">Click any number to toggle:</div>
            <div className="grid grid-cols-10 sm:grid-cols-14 gap-1 max-h-48 overflow-y-auto pr-1">
              {Array.from({ length: 70 }, (_, i) => i + 1).map((n) => {
                const isSelected = settings.numbers.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => (isSelected ? removeNumber(n) : addNumber(n))}
                    className={`h-7 rounded text-xs font-mono-tabular font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 shadow-xs'
                        : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Lucky Numbers Chips */}
        <div className="mt-4 pt-3 border-t border-neutral-800/60">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Active Lucky Signature ({settings.numbers.length})</span>
            <span className="text-[11px] text-neutral-500 font-mono-tabular">Range: 1 – 70</span>
          </div>

          {settings.numbers.length === 0 ? (
            <div className="p-3 bg-neutral-950/40 rounded-lg border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
              No lucky numbers added yet. Type your numbers above, choose a preset, or let pure atmospheric physics govern the draw.
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {settings.numbers.map((num) => (
                <div
                  key={num}
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-200 text-xs font-mono-tabular"
                >
                  <span className="font-bold">{num < 10 ? `0${num}` : num}</span>
                  <button
                    type="button"
                    onClick={() => removeNumber(num)}
                    className="p-0.5 rounded hover:bg-amber-500/20 text-amber-400 hover:text-amber-100 transition-colors"
                    aria-label={`Remove lucky number ${num}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
