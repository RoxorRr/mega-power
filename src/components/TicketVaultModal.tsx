/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LotteryTicket } from '../types/lottery';
import { LotteryBall } from './LotteryBall';
import { 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Vault, 
  Download, 
  ExternalLink,
  Coins,
  Flame
} from 'lucide-react';

interface TicketVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTickets: LotteryTicket[];
  onRemoveTicket: (id: string) => void;
  onClearAll: () => void;
}

export const TicketVaultModal: React.FC<TicketVaultModalProps> = ({
  isOpen,
  onClose,
  savedTickets,
  onRemoveTicket,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'megamillions' | 'powerball'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTickets = savedTickets.filter((t) => {
    if (filter === 'all') return true;
    return t.game === filter;
  });

  const handleCopy = (ticket: LotteryTicket) => {
    const gameName = ticket.game === 'megamillions' ? 'Mega Millions' : 'Powerball';
    const bonusName = ticket.game === 'megamillions' ? 'Mega Ball' : 'Powerball';
    const text = `${gameName} [${ticket.drawDate}]: ${ticket.whiteBalls.join(', ')} + ${bonusName} ${ticket.bonusBall} (${ticket.multiplierLabel})`;
    navigator.clipboard.writeText(text);
    setCopiedId(ticket.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(savedTickets, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auraball-lottery-vault-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[85vh] bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Vault className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-serif-display">Ticket Vault</h3>
              <p className="text-xs text-neutral-400">
                {savedTickets.length} vaulted combinations ready for play
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

        {/* Filter bar & Actions */}
        <div className="px-6 py-3 bg-neutral-950/60 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All ({savedTickets.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('megamillions')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                filter === 'megamillions' ? 'bg-amber-500/20 text-amber-300 shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Coins className="w-3 h-3 text-amber-400" />
              <span>Mega Millions</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('powerball')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                filter === 'powerball' ? 'bg-red-500/20 text-red-300 shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Flame className="w-3 h-3 text-red-400" />
              <span>Powerball</span>
            </button>
          </div>

          {savedTickets.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="px-3 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-neutral-400" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={onClearAll}
                className="px-3 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-neutral-800 rounded-md transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Clear Vault</span>
              </button>
            </div>
          )}
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Vault className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
              <p className="text-sm text-neutral-400 font-medium">No tickets in this category</p>
              <p className="text-xs text-neutral-600 mt-1">
                Synthesize numbers on the main dashboard and click "Save" to vault them here.
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isMega = ticket.game === 'megamillions';
              return (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-xl border bg-neutral-950/80 transition-all ${
                    isMega ? 'border-amber-500/30' : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isMega ? 'text-amber-400' : 'text-red-400'}`}>
                        {isMega ? 'Mega Millions' : 'Powerball'}
                      </span>
                      <span className="text-neutral-600">·</span>
                      <span className="text-neutral-400 font-mono-tabular">Draw: {ticket.drawDate}</span>
                      <span className="text-neutral-600">·</span>
                      <span className="text-neutral-500 font-mono-tabular text-[11px]">{ticket.multiplierLabel}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(ticket)}
                        className="px-2 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded transition-colors flex items-center gap-1"
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
                        onClick={() => onRemoveTicket(ticket.id)}
                        className="p-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove from vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Balls display */}
                  <div className="pt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ticket.whiteBalls.map((num) => (
                        <LotteryBall
                          key={`${ticket.id}-${num}`}
                          number={num}
                          type="white"
                          size="sm"
                          animate={false}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pl-3 border-l border-neutral-800">
                      <LotteryBall
                        number={ticket.bonusBall}
                        type={isMega ? 'gold' : 'red'}
                        size="sm"
                        animate={false}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
