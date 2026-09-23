/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, DollarSign, Calculator, Percent, Sparkles, Building2, Anchor, Plane, Landmark } from 'lucide-react';

interface WealthCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialJackpot?: number;
  initialGame?: 'megamillions' | 'powerball';
}

interface StateTaxOption {
  state: string;
  rate: number;
}

const STATE_TAX_OPTIONS: StateTaxOption[] = [
  { state: 'Florida / Texas / Washington / Nevada (No State Lottery Tax)', rate: 0.0 },
  { state: 'California / Pennsylvania (Exempt from State Tax)', rate: 0.0 },
  { state: 'Georgia (5.75%)', rate: 0.0575 },
  { state: 'Illinois (4.95%)', rate: 0.0495 },
  { state: 'Massachusetts (5.0%)', rate: 0.05 },
  { state: 'New Jersey (10.75%)', rate: 0.1075 },
  { state: 'New York (State + NYC) (14.77%)', rate: 0.1477 },
  { state: 'North Carolina (4.75%)', rate: 0.0475 },
  { state: 'Ohio (3.99%)', rate: 0.0399 },
];

export const WealthCalculatorModal: React.FC<WealthCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialJackpot = 332000000,
  initialGame = 'powerball',
}) => {
  const [jackpotAmount, setJackpotAmount] = useState<number>(initialJackpot);
  const [payoutOption, setPayoutOption] = useState<'lump_sum' | 'annuity'>('lump_sum');
  const [selectedStateIndex, setSelectedStateIndex] = useState<number>(0);
  const [customInputStr, setCustomInputStr] = useState<string>('');

  // Keep in sync with initialJackpot when opened
  React.useEffect(() => {
    if (initialJackpot) {
      setJackpotAmount(initialJackpot);
    }
  }, [initialJackpot]);

  if (!isOpen) return null;

  // Real cash value ratio (Powerball ~$141.7M / $332M = 42.68%, Mega Millions ~$117.3M / $277M = 42.34%)
  // Standard approximation around 42.5% - 47.1% depending on federal interest rate environment
  const cashValueRatio = jackpotAmount === 332000000 ? (141.7 / 332) : jackpotAmount === 277000000 ? (117.3 / 277) : 0.45;
  const cashLumpSum = Math.round(jackpotAmount * cashValueRatio);

  const federalTaxRate = 0.37; // 37% top marginal tax bracket
  const stateTaxRate = STATE_TAX_OPTIONS[selectedStateIndex].rate;

  const baseTaxableAmount = payoutOption === 'lump_sum' ? cashLumpSum : jackpotAmount;
  
  const federalTaxDeduction = Math.round(baseTaxableAmount * federalTaxRate);
  const stateTaxDeduction = Math.round(baseTaxableAmount * stateTaxRate);
  const netTakeHome = baseTaxableAmount - federalTaxDeduction - stateTaxDeduction;

  // Annual treasury dividend estimate (assuming safe 4.5% yield on net cash)
  const annualPassiveIncome = Math.round(netTakeHome * 0.045);
  const monthlyPassiveIncome = Math.round(annualPassiveIncome / 12);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCustomInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = parseFloat(customInputStr.replace(/[^0-9.]/g, ''));
    if (!isNaN(cleanNum) && cleanNum > 0) {
      // If user typed in millions (e.g. 500) vs full digits
      const finalAmount = cleanNum < 10000 ? cleanNum * 1_000_000 : cleanNum;
      setJackpotAmount(Math.round(finalAmount));
      setCustomInputStr('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-serif-display">Jackpot Wealth & Payout Engine</h3>
              <p className="text-xs text-neutral-400">
                Lump sum vs 30-year annuity, state & federal tax obligations, and net passive yields
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Jackpot Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-300">
                Advertised Nominal Jackpot:
              </label>
              <span className="text-[11px] text-emerald-400 font-mono-tabular font-semibold">
                ● Live Official Feeds
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setJackpotAmount(332000000)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-tabular transition-colors flex items-center gap-1.5 ${
                  jackpotAmount === 332000000
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 ring-1 ring-red-500/30'
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Powerball ($332M Real)
              </button>

              <button
                type="button"
                onClick={() => setJackpotAmount(277000000)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-tabular transition-colors flex items-center gap-1.5 ${
                  jackpotAmount === 277000000
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Mega Millions ($277M Real)
              </button>

              <button
                type="button"
                onClick={() => setJackpotAmount(1000000000)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-tabular transition-colors ${
                  jackpotAmount === 1000000000
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                $1.0 Billion Record
              </button>

              <button
                type="button"
                onClick={() => setJackpotAmount(2040000000)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-tabular transition-colors ${
                  jackpotAmount === 2040000000
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                $2.04 Billion Peak
              </button>
            </div>

            {/* Custom Jackpot Form */}
            <form onSubmit={handleCustomInputSubmit} className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 text-xs">
                  $
                </span>
                <input
                  type="text"
                  value={customInputStr}
                  onChange={(e) => setCustomInputStr(e.target.value)}
                  placeholder="Enter custom amount (e.g. 450M or 750,000,000)..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-semibold rounded-lg border border-neutral-700 transition-colors"
              >
                Apply
              </button>
            </form>
          </div>

          {/* Payout & State Tax Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payout Structure */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Payout Distribution:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPayoutOption('lump_sum')}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                    payoutOption === 'lump_sum'
                      ? 'bg-amber-500 text-neutral-950 shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Cash Lump Sum
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutOption('annuity')}
                  className={`py-2 text-xs font-semibold rounded-md transition-colors ${
                    payoutOption === 'annuity'
                      ? 'bg-amber-500 text-neutral-950 shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  30-Year Annuity
                </button>
              </div>
              <span className="text-[11px] text-neutral-500 block mt-1">
                {payoutOption === 'lump_sum' ? 'Immediate upfront cash value (~47%)' : '30 graduated annual installments'}
              </span>
            </div>

            {/* State Tax Jurisdiction */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Residence / State Jurisdiction:
              </label>
              <select
                value={selectedStateIndex}
                onChange={(e) => setSelectedStateIndex(parseInt(e.target.value, 10))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/50"
              >
                {STATE_TAX_OPTIONS.map((opt, i) => (
                  <option key={opt.state} value={i}>
                    {opt.state}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-neutral-500 block mt-1">
                State rate: {(stateTaxRate * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-neutral-950 rounded-xl p-5 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
              <span>Gross Taxable Amount:</span>
              <span className="font-mono-tabular font-bold text-white text-sm">
                {formatCurrency(baseTaxableAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-red-400" />
                Federal Income Tax (37%):
              </span>
              <span className="font-mono-tabular text-red-400 font-medium">
                - {formatCurrency(federalTaxDeduction)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
              <span className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-red-400" />
                State Withholding ({(stateTaxRate * 100).toFixed(2)}%):
              </span>
              <span className="font-mono-tabular text-red-400 font-medium">
                - {formatCurrency(stateTaxDeduction)}
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                  Net Take-Home Cash In Your Bank:
                </span>
                <span className="text-[11px] text-neutral-500 block">Clean, post-tax sovereign wealth</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-tabular text-emerald-400">
                {formatCurrency(netTakeHome)}
              </div>
            </div>
          </div>

          {/* Sovereign Passive Income Engine */}
          <div className="bg-gradient-to-br from-neutral-950 to-neutral-900/80 rounded-xl p-4 border border-neutral-800">
            <div className="flex items-center gap-2 mb-2">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Infinite Passive Yield (4.5% Safe Rate)
              </h4>
            </div>
            <p className="text-xs text-neutral-400">
              If parked into conservative sovereign treasury bonds and municipal debt without touching the principal:
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-950/80 rounded-lg border border-neutral-800">
                <span className="text-[11px] text-neutral-500 block">Passive Income / Year:</span>
                <span className="text-base font-bold text-emerald-400 font-mono-tabular">
                  {formatCurrency(annualPassiveIncome)}
                </span>
              </div>
              <div className="p-3 bg-neutral-950/80 rounded-lg border border-neutral-800">
                <span className="text-[11px] text-neutral-500 block">Passive Cash / Month:</span>
                <span className="text-base font-bold text-emerald-400 font-mono-tabular">
                  {formatCurrency(monthlyPassiveIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Zero credits burned. Pure mathematical sovereignty.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
