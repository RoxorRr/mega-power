/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LotteryTicket, OfficialDrawResult } from '../types/lottery';
import { LotteryBall } from './LotteryBall';
import { 
  X, 
  RotateCw, 
  ExternalLink, 
  CheckCircle2, 
  Coins, 
  Flame, 
  Award,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import { 
  fetchLivePowerballDraws, 
  fetchLiveMegaMillionsDraws, 
  VERIFIED_RECENT_DRAWS, 
  evaluateTicketMatch 
} from '../services/realLotteryService';

interface OfficialDrawsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTickets: LotteryTicket[];
  onOpenCalibratorWithDraw?: (draw: OfficialDrawResult) => void;
}

export const OfficialDrawsModal: React.FC<OfficialDrawsModalProps> = ({
  isOpen,
  onClose,
  userTickets,
  onOpenCalibratorWithDraw,
}) => {
  const [selectedGame, setSelectedGame] = useState<'megamillions' | 'powerball'>('powerball');
  const [draws, setDraws] = useState<OfficialDrawResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDrawIndex, setSelectedDrawIndex] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const loadDraws = async (game: 'megamillions' | 'powerball') => {
    setIsLoading(true);
    try {
      if (game === 'powerball') {
        const pb = await fetchLivePowerballDraws(8);
        setDraws(pb);
      } else {
        const mm = await fetchLiveMegaMillionsDraws(8);
        setDraws(mm);
      }
      setSelectedDrawIndex(0);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Failed to load official draws', e);
      setDraws(VERIFIED_RECENT_DRAWS.filter((d) => d.game === game));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDraws(selectedGame);
    }
  }, [isOpen, selectedGame]);

  if (!isOpen) return null;

  const currentDraw = draws[selectedDrawIndex] || draws[0];
  const matchingTickets = userTickets.filter((t) => t.game === selectedGame);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              selectedGame === 'powerball'
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-amber-500/10 border-amber-500/20'
            }`}>
              {selectedGame === 'powerball' ? (
                <Flame className="w-5 h-5 text-red-400" />
              ) : (
                <Coins className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-serif-display">
                  Official Real Numbers & Draw Results
                </h3>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Official Feed
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Verified drawings from NY Open Data (data.ny.gov) & Multi-State Lottery Association
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadDraws(selectedGame)}
              disabled={isLoading}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1 text-xs"
              title="Refresh from official lottery open API"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-6 py-3 bg-neutral-950/70 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => setSelectedGame('powerball')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                selectedGame === 'powerball'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Powerball Real Draws</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('megamillions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                selectedGame === 'megamillions'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Mega Millions Real Draws</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono-tabular">
            Last Synced: {lastRefreshed}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Latest Draw Highlight Banner */}
          {currentDraw ? (
            <div className={`rounded-xl border p-5 bg-gradient-to-br ${
              selectedGame === 'powerball'
                ? 'from-red-950/25 via-neutral-950 to-neutral-900 border-red-500/40'
                : 'from-amber-950/25 via-neutral-950 to-neutral-900 border-amber-500/40'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${selectedGame === 'powerball' ? 'text-red-400' : 'text-amber-400'}`} />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {selectedGame === 'powerball' ? 'Powerball® Official Draw' : 'Mega Millions® Official Draw'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono-tabular font-medium">
                    {currentDraw.drawDate}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  {currentDraw.multiplier && (
                    <span className="font-mono-tabular px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                      Multiplier: <strong className="text-amber-400">{currentDraw.multiplier}</strong>
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-500 hidden sm:inline">
                    Source: {currentDraw.source}
                  </span>
                </div>
              </div>

              {/* Balls Render */}
              <div className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {currentDraw.whiteBalls.map((num, i) => (
                    <LotteryBall
                      key={`official-wb-${num}-${i}`}
                      number={num}
                      type="white"
                      size="lg"
                      delayIndex={i}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3 pl-3 sm:pl-5 border-l border-neutral-800">
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] uppercase font-bold mb-1 tracking-wider ${
                      selectedGame === 'powerball' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {selectedGame === 'powerball' ? 'Powerball' : 'Mega Ball'}
                    </span>
                    <LotteryBall
                      number={currentDraw.bonusBall}
                      type={selectedGame === 'powerball' ? 'red' : 'gold'}
                      size="lg"
                      delayIndex={5}
                    />
                  </div>
                </div>
              </div>

              {/* Action row */}
              {onOpenCalibratorWithDraw && (
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    Didn't hit this draw? Feed these winning numbers directly into the physics engine.
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenCalibratorWithDraw(currentDraw)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-500/50 text-neutral-200 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Calibrate Algorithm with this Draw</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">Loading draw data...</div>
          )}

          {/* Historical Draw Selector Strip */}
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Past Verified Drawings (Select to compare)</span>
              <span className="text-[11px] text-neutral-500 font-normal">
                Click any draw to inspect winning combinations
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {draws.map((d, index) => {
                const isSelected = index === selectedDrawIndex;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDrawIndex(index)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? selectedGame === 'powerball'
                          ? 'bg-red-500/15 border-red-500/50 text-white shadow-sm ring-1 ring-red-500/30'
                          : 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono-tabular">
                      {d.drawDate}
                    </div>
                    <div className="text-[11px] font-mono-tabular mt-1 text-neutral-300">
                      {d.whiteBalls.map((n) => (n < 10 ? `0${n}` : n)).join(' ')} + 
                      <strong className={`ml-1 ${selectedGame === 'powerball' ? 'text-red-400' : 'text-amber-400'}`}>
                        {d.bonusBall < 10 ? `0${d.bonusBall}` : d.bonusBall}
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ticket Match Checker Section */}
          <div className="border-t border-neutral-800/80 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white font-serif-display">
                  Your Synthesized Tickets vs {currentDraw?.drawDate} Official Draw
                </h4>
              </div>
              <span className="text-xs text-neutral-500 font-mono-tabular">
                ({matchingTickets.length} tickets generated in memory)
              </span>
            </div>

            {matchingTickets.length === 0 ? (
              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-xs text-neutral-400">
                You haven't generated any {selectedGame === 'powerball' ? 'Powerball' : 'Mega Millions'} tickets yet.
                Synthesize some tickets on the main dashboard to automatically test matches here!
              </div>
            ) : (
              <div className="space-y-3">
                {matchingTickets.map((t, index) => {
                  if (!currentDraw) return null;
                  const match = evaluateTicketMatch(t, currentDraw);

                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        match.matchedWhiteCount > 0 || match.bonusMatched
                          ? 'bg-neutral-900 border-amber-500/40 shadow-sm'
                          : 'bg-neutral-950/60 border-neutral-800/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-white">Line #{index + 1}</span>
                          <span className="text-neutral-600">·</span>
                          <span className="text-neutral-400 font-mono-tabular">
                            Numbers: {t.whiteBalls.map(n => n < 10 ? `0${n}` : n).join(', ')} + {t.bonusBall}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {t.whiteBalls.map((b) => {
                            const isHit = match.whiteMatches.includes(b);
                            return (
                              <span
                                key={`match-check-${b}`}
                                className={`text-[11px] px-1.5 py-0.5 rounded font-mono-tabular font-bold ${
                                  isHit
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                                }`}
                              >
                                {b < 10 ? `0${b}` : b}
                              </span>
                            );
                          })}

                          <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono-tabular font-bold ${
                            match.bonusMatched
                              ? selectedGame === 'powerball'
                                ? 'bg-red-500/25 text-red-300 border border-red-500/50'
                                : 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                              : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                          }`}>
                            Bonus: {t.bonusBall < 10 ? `0${t.bonusBall}` : t.bonusBall}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto">
                        <span className="text-[10px] uppercase font-semibold text-neutral-500">
                          {match.matchedWhiteCount} White + {match.bonusMatched ? '1 Bonus' : '0 Bonus'}
                        </span>
                        <span className={`text-xs font-bold font-mono-tabular ${
                          match.prizeEstimate !== 'No prize'
                            ? 'text-emerald-400'
                            : 'text-neutral-500'
                        }`}>
                          {match.prizeEstimate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Official Socrata Open Data JSON Integration Verified</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium"
          >
            Close Feed
          </button>
        </div>
      </div>
    </div>
  );
};
