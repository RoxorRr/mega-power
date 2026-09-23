/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LotteryTicket } from '../types/lottery';
import { LotteryBall } from './LotteryBall';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Bookmark, 
  Printer, 
  Info, 
  Flame, 
  Coins, 
  Share2,
  Layers,
  History,
  Sliders
} from 'lucide-react';

interface ResultsDisplayProps {
  tickets: LotteryTicket[];
  isGenerating: boolean;
  onSaveTicket: (ticket: LotteryTicket) => void;
  onSaveAllTickets: () => void;
  savedTicketIds: string[];
  activeGameFilter: 'megamillions' | 'powerball' | 'both';
  ticketSpreadCount: number;
  onChangeSpreadCount: (count: number) => void;
  onRegenerate: () => void;
  onCheckMatches?: () => void;
  onOpenCalibrator?: () => void;
  isCalibrated?: boolean;
  calibratedDrawCount?: number;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  tickets,
  isGenerating,
  onSaveTicket,
  onSaveAllTickets,
  savedTicketIds,
  activeGameFilter,
  ticketSpreadCount,
  onChangeSpreadCount,
  onRegenerate,
  onCheckMatches,
  onOpenCalibrator,
  isCalibrated,
  calibratedDrawCount = 0,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedAttributionId, setExpandedAttributionId] = useState<string | null>(null);

  const handleCopyTicket = (ticket: LotteryTicket) => {
    const gameName = ticket.game === 'megamillions' ? 'Mega Millions' : 'Powerball';
    const bonusName = ticket.game === 'megamillions' ? 'Mega Ball' : 'Powerball';
    const text = `${gameName} [${ticket.drawDate}] Numbers: ${ticket.whiteBalls.map(n => n < 10 ? `0${n}` : n).join(', ')} | ${bonusName}: ${ticket.bonusBall < 10 ? `0${ticket.bonusBall}` : ticket.bonusBall} | ${ticket.multiplierLabel}`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(ticket.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrintSlip = (ticket: LotteryTicket) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const gameTitle = ticket.game === 'megamillions' ? 'MEGA MILLIONS® PLAY SLIP' : 'POWERBALL® PLAY SLIP';
    const bonusName = ticket.game === 'megamillions' ? 'MEGA BALL' : 'POWERBALL';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${gameTitle}</title>
          <style>
            body { font-family: monospace; padding: 24px; color: #111; max-width: 420px; margin: 0 auto; border: 2px dashed #333; }
            h2 { text-align: center; margin-bottom: 4px; }
            .date { text-align: center; font-size: 13px; margin-bottom: 16px; }
            .balls { display: flex; justify-content: space-around; font-size: 24px; font-weight: bold; margin: 20px 0; }
            .bonus { text-align: center; font-size: 20px; font-weight: bold; margin: 12px 0; color: #b91c1c; }
            .multiplier { text-align: center; font-size: 14px; margin-bottom: 20px; font-weight: bold; }
            .entropy { font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; margin-top: 16px; }
            @media print { body { border: 1px solid #000; } }
          </style>
        </head>
        <body>
          <h2>${gameTitle}</h2>
          <div class="date">OFFICIAL DRAW DATE: ${ticket.drawDate}</div>
          <div style="font-size: 12px; text-align: center; text-transform: uppercase;">White Balls</div>
          <div class="balls">
            ${ticket.whiteBalls.map(n => `<span>[${n < 10 ? '0' + n : n}]</span>`).join(' ')}
          </div>
          <div class="bonus">${bonusName}: [${ticket.bonusBall < 10 ? '0' + ticket.bonusBall : ticket.bonusBall}]</div>
          <div class="multiplier">${ticket.multiplierLabel}</div>
          <div class="entropy">
            ATMOSPHERIC SYNTHESIS SEED: ${ticket.attribution.entropySeedHex}<br>
            TIMESTAMP: ${ticket.generatedAt} | STATUS: QUANTUM VERIFIED
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  // Group tickets by game
  const mmTickets = tickets.filter(t => t.game === 'megamillions');
  const pbTickets = tickets.filter(t => t.game === 'powerball');

  return (
    <div id="results" className="mt-8">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif-display">
              Synthesized Numbers & Quantum Output
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Computed via aerodynamic friction, barometric isobar lift, Wall Street liquidity momentum, and lucky resonance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Spread Count Selector */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <span className="text-[11px] text-neutral-500 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Spread:
            </span>
            <button
              type="button"
              onClick={() => onChangeSpreadCount(1)}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                ticketSpreadCount === 1 ? 'bg-amber-500 text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              1 Line
            </button>
            <button
              type="button"
              onClick={() => onChangeSpreadCount(3)}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                ticketSpreadCount === 3 ? 'bg-amber-500 text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              3 Lines
            </button>
            <button
              type="button"
              onClick={() => onChangeSpreadCount(5)}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                ticketSpreadCount === 5 ? 'bg-amber-500 text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              5 Syndicate
            </button>
          </div>

          {onCheckMatches && (
            <button
              type="button"
              onClick={onCheckMatches}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-500/40 text-neutral-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Check Real Winning Draws</span>
            </button>
          )}

          {onOpenCalibrator && (
            <button
              type="button"
              onClick={onOpenCalibrator}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-500/40 text-neutral-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isCalibrated ? `Calibrated (${calibratedDrawCount})` : 'Calibrate Algorithm'}</span>
            </button>
          )}

          {tickets.length > 1 && (
            <button
              type="button"
              onClick={onSaveAllTickets}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Save All</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 text-xs font-bold rounded-lg transition-all active:scale-95 shadow-md shadow-amber-500/10 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
            <span>{isGenerating ? 'Synthesizing...' : 'Resynthesize'}</span>
          </button>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      <div className="mt-6 space-y-8">
        {/* Mega Millions Section */}
        {(activeGameFilter === 'megamillions' || activeGameFilter === 'both') && mmTickets.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-amber-400 uppercase tracking-wider">
                Mega Millions® Quantum Lines
              </h3>
              <span className="text-xs text-neutral-500 font-mono-tabular">({mmTickets.length} active)</span>
            </div>

            <div className="space-y-4">
              {mmTickets.map((ticket, index) => {
                const isSaved = savedTicketIds.includes(ticket.id);
                const isAttributionOpen = expandedAttributionId === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-5 shadow-lg relative overflow-hidden group transition-all"
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="font-semibold text-white">Line #{index + 1}</span>
                        <span className="text-neutral-600">·</span>
                        <span>Draw Date: <strong className="text-neutral-200 font-mono-tabular">{ticket.drawDate}</strong></span>
                        <span className="text-neutral-600">·</span>
                        <span className="font-mono-tabular text-[11px] text-amber-400/90">{ticket.multiplierLabel}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyTicket(ticket)}
                          className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded transition-colors flex items-center gap-1"
                          title="Copy ticket numbers"
                        >
                          {copiedId === ticket.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-neutral-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSaveTicket(ticket)}
                          className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1 ${
                            isSaved
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-neutral-900 text-neutral-300 hover:text-white border-neutral-800 hover:bg-neutral-800'
                          }`}
                          title={isSaved ? 'Saved in Vault' : 'Save to Vault'}
                        >
                          <Bookmark className={`w-3 h-3 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-neutral-400'}`} />
                          <span>{isSaved ? 'Vaulted' : 'Save'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintSlip(ticket)}
                          className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded transition-colors flex items-center gap-1"
                          title="Print official style play slip"
                        >
                          <Printer className="w-3 h-3 text-neutral-400" />
                          <span>Print Slip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedAttributionId(isAttributionOpen ? null : ticket.id)}
                          className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                          title="View atmospheric attribution details"
                        >
                          <Info className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                      </div>
                    </div>

                    {/* Ball Row */}
                    <div className="py-5 flex flex-wrap items-center justify-between gap-4">
                      {/* 5 White Balls */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {ticket.whiteBalls.map((num, i) => (
                          <LotteryBall
                            key={`${ticket.id}-wb-${num}`}
                            number={num}
                            type="white"
                            size="lg"
                            delayIndex={i}
                          />
                        ))}
                      </div>

                      {/* Divider + Mega Ball */}
                      <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-neutral-800">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] uppercase font-bold text-amber-400 mb-1 tracking-wider">
                            Mega Ball
                          </span>
                          <LotteryBall
                            number={ticket.bonusBall}
                            type="gold"
                            size="lg"
                            delayIndex={6}
                          />
                        </div>

                        {/* Multiplier Badge */}
                        <div className="hidden sm:flex flex-col items-center px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <span className="text-[10px] uppercase text-neutral-400 font-semibold">Megaplier</span>
                          <span className="text-base font-extrabold text-amber-300 font-mono-tabular">
                            {ticket.multiplier}X
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Quantum Harmonic Attribution Panel */}
                    {isAttributionOpen && (
                      <div className="mt-3 pt-3 border-t border-neutral-800/80 bg-neutral-950/60 rounded-lg p-3 text-xs">
                        <div className="font-semibold text-neutral-300 mb-2 flex items-center justify-between">
                          <span>Physical & Market Harmonic Breakdown:</span>
                          <span className="text-[10px] font-mono-tabular text-neutral-500">Seed: {ticket.attribution.entropySeedHex}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Temperature Vector:</span>
                            <span className="text-amber-200 font-mono-tabular font-medium">{ticket.attribution.temperatureVector}</span>
                          </div>
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Barometric Lift:</span>
                            <span className="text-blue-200 font-mono-tabular font-medium">{ticket.attribution.pressureLiftIndex}</span>
                          </div>
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Wind Shear:</span>
                            <span className="text-cyan-200 font-mono-tabular font-medium">{ticket.attribution.windTurbulenceDelta}</span>
                          </div>
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Solar/Sky Opacity:</span>
                            <span className="text-neutral-200 font-medium">{ticket.attribution.skySolarVariance}</span>
                          </div>
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Wall Street Momentum:</span>
                            <span className="text-emerald-200 font-mono-tabular font-medium">{ticket.attribution.marketMomentumSkew}</span>
                          </div>
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Lucky Signature:</span>
                            <span className="text-amber-300 font-medium">{ticket.attribution.luckyResonanceFactor}</span>
                          </div>
                          {ticket.attribution.calibrationOffset && (
                            <div className="p-2 bg-emerald-950/40 rounded border border-emerald-500/30 col-span-2 sm:col-span-3">
                              <span className="text-emerald-400 font-semibold block text-[10px] uppercase">Empirical Feedback Calibration:</span>
                              <span className="text-emerald-200 font-mono-tabular font-medium">{ticket.attribution.calibrationOffset}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Powerball Section */}
        {(activeGameFilter === 'powerball' || activeGameFilter === 'both') && pbTickets.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-red-400" />
              <h3 className="text-base font-bold text-red-400 uppercase tracking-wider">
                Powerball® Atmospheric Lines
              </h3>
              <span className="text-xs text-neutral-500 font-mono-tabular">({pbTickets.length} active)</span>
            </div>

            <div className="space-y-4">
              {pbTickets.map((ticket, index) => {
                const isSaved = savedTicketIds.includes(ticket.id);
                const isAttributionOpen = expandedAttributionId === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    className="rounded-xl border border-red-500/30 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-5 shadow-lg relative overflow-hidden group transition-all"
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="font-semibold text-white">Line #{index + 1}</span>
                        <span className="text-neutral-600">·</span>
                        <span>Draw Date: <strong className="text-neutral-200 font-mono-tabular">{ticket.drawDate}</strong></span>
                        <span className="text-neutral-600">·</span>
                        <span className="font-mono-tabular text-[11px] text-red-400/90">{ticket.multiplierLabel}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyTicket(ticket)}
                          className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded transition-colors flex items-center gap-1"
                          title="Copy ticket numbers"
                        >
                          {copiedId === ticket.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-neutral-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSaveTicket(ticket)}
                          className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1 ${
                            isSaved
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-neutral-900 text-neutral-300 hover:text-white border-neutral-800 hover:bg-neutral-800'
                          }`}
                          title={isSaved ? 'Saved in Vault' : 'Save to Vault'}
                        >
                          <Bookmark className={`w-3 h-3 ${isSaved ? 'text-red-400 fill-red-400' : 'text-neutral-400'}`} />
                          <span>{isSaved ? 'Vaulted' : 'Save'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintSlip(ticket)}
                          className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded transition-colors flex items-center gap-1"
                          title="Print official style play slip"
                        >
                          <Printer className="w-3 h-3 text-neutral-400" />
                          <span>Print Slip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedAttributionId(isAttributionOpen ? null : ticket.id)}
                          className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
                          title="View atmospheric attribution details"
                        >
                          <Info className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                      </div>
                    </div>

                    {/* Ball Row */}
                    <div className="py-5 flex flex-wrap items-center justify-between gap-4">
                      {/* 5 White Balls */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {ticket.whiteBalls.map((num, i) => (
                          <LotteryBall
                            key={`${ticket.id}-wb-${num}`}
                            number={num}
                            type="white"
                            size="lg"
                            delayIndex={i}
                          />
                        ))}
                      </div>

                      {/* Divider + Powerball */}
                      <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-neutral-800">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] uppercase font-bold text-red-400 mb-1 tracking-wider">
                            Powerball
                          </span>
                          <LotteryBall
                            number={ticket.bonusBall}
                            type="red"
                            size="lg"
                            delayIndex={6}
                          />
                        </div>

                        {/* Power Play Badge */}
                        <div className="hidden sm:flex flex-col items-center px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                          <span className="text-[10px] uppercase text-neutral-400 font-semibold">Power Play</span>
                          <span className="text-base font-extrabold text-red-300 font-mono-tabular">
                            {ticket.multiplier}X
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Quantum Harmonic Attribution Panel */}
                    {isAttributionOpen && (
                      <div className="mt-3 pt-3 border-t border-neutral-800/80 bg-neutral-950/60 rounded-lg p-3 text-xs">
                        <div className="font-semibold text-neutral-300 mb-2 flex items-center justify-between">
                          <span>Physical & Market Harmonic Breakdown:</span>
                          <span className="text-[10px] font-mono-tabular text-neutral-500">Seed: {ticket.attribution.entropySeedHex}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Temperature Vector:</span>
                            <span className="text-amber-200 font-mono-tabular font-medium">{ticket.attribution.temperatureVector}</span>
                          </div>
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Barometric Lift:</span>
                            <span className="text-blue-200 font-mono-tabular font-medium">{ticket.attribution.pressureLiftIndex}</span>
                          </div>
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Wind Shear:</span>
                            <span className="text-cyan-200 font-mono-tabular font-medium">{ticket.attribution.windTurbulenceDelta}</span>
                          </div>
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Solar/Sky Opacity:</span>
                            <span className="text-neutral-200 font-medium">{ticket.attribution.skySolarVariance}</span>
                          </div>
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Wall Street Momentum:</span>
                            <span className="text-emerald-200 font-mono-tabular font-medium">{ticket.attribution.marketMomentumSkew}</span>
                          </div>
                          <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                            <span className="text-neutral-500 block">Lucky Signature:</span>
                            <span className="text-amber-300 font-medium">{ticket.attribution.luckyResonanceFactor}</span>
                          </div>
                          {ticket.attribution.calibrationOffset && (
                            <div className="p-2 bg-emerald-950/40 rounded border border-emerald-500/30 col-span-2 sm:col-span-3">
                              <span className="text-emerald-400 font-semibold block text-[10px] uppercase">Empirical Feedback Calibration:</span>
                              <span className="text-emerald-200 font-mono-tabular font-medium">{ticket.attribution.calibrationOffset}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
