/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { JackpotBanner } from './components/JackpotBanner';
import { WeatherControls } from './components/WeatherControls';
import { MarketAndDateControls } from './components/MarketAndDateControls';
import { LuckyNumbersInput } from './components/LuckyNumbersInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { TicketVaultModal } from './components/TicketVaultModal';
import { WealthCalculatorModal } from './components/WealthCalculatorModal';
import { OfficialDrawsModal } from './components/OfficialDrawsModal';
import { AlgorithmCalibratorModal } from './components/AlgorithmCalibratorModal';
import { 
  LotteryTicket, 
  MarketData, 
  WeatherData, 
  LuckyNumberSettings,
  RealJackpotInfo,
  AlgorithmCalibrationProfile,
  CalibrationDrawEntry,
  OfficialDrawResult
} from './types/lottery';
import { 
  generateQuantumTicket, 
  getNextDrawDate,
  DEFAULT_CALIBRATION_PROFILE,
  calculateCalibrationProfile
} from './utils/lotteryEngine';
import { 
  INITIAL_REAL_JACKPOTS, 
  formatJackpotCurrency 
} from './services/realLotteryService';
import { Sparkles, Compass, ShieldAlert, Cpu } from 'lucide-react';

const STORAGE_KEY = 'auraball_saved_tickets_v1';
const CALIBRATION_STORAGE_KEY = 'auraball_calibration_profile_v1';

export default function App() {
  // Real Jackpots State
  const [realJackpots, setRealJackpots] = useState<Record<'megamillions' | 'powerball', RealJackpotInfo>>(INITIAL_REAL_JACKPOTS);

  // Game selection: Mega Millions, Powerball, or both
  const [activeGameFilter, setActiveGameFilter] = useState<'megamillions' | 'powerball' | 'both'>('both');

  // Next upcoming draw date (default to next Powerball or Mega Millions draw date)
  const [drawDate, setDrawDate] = useState<string>(() => {
    const nextMM = getNextDrawDate('megamillions');
    return nextMM.toISOString().split('T')[0];
  });

  // Environmental Weather State
  const [weather, setWeather] = useState<WeatherData>({
    temperatureF: 74.0,
    pressureHpa: 1013.25,
    windSpeedMph: 8.5,
    condition: 'sunny',
    humidityPercent: 48,
    locationName: 'Standard Atmospheric Reference (STP)',
  });

  // Wall Street Market State
  const [market, setMarket] = useState<MarketData>({
    sp500ChangePercent: 1.25,
    sp500Level: 5880.4,
    dowChangePercent: 0.85,
    dowLevel: 42450.0,
    nasdaqChangePercent: 1.75,
    nasdaqLevel: 18420.0,
    vix: 14.2,
    regime: 'bull',
  });

  // Lucky numbers settings
  const [luckySettings, setLuckySettings] = useState<LuckyNumberSettings>({
    numbers: [7, 11, 21, 33, 42],
    mode: 'harmonic_weight',
  });

  // Ticket spread count (1 line, 3 lines, or 5 syndicate lines)
  const [ticketSpreadCount, setTicketSpreadCount] = useState<number>(1);

  // Generated tickets
  const [tickets, setTickets] = useState<LotteryTicket[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Saved tickets in Vault
  const [savedTickets, setSavedTickets] = useState<LotteryTicket[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [isWealthCalcOpen, setIsWealthCalcOpen] = useState<boolean>(false);
  const [isOfficialDrawsOpen, setIsOfficialDrawsOpen] = useState<boolean>(false);
  const [isCalibratorOpen, setIsCalibratorOpen] = useState<boolean>(false);
  const [calcJackpotAmount, setCalcJackpotAmount] = useState<number>(332000000);
  const [calcGame, setCalcGame] = useState<'megamillions' | 'powerball'>('powerball');

  // Algorithmic Calibration Feedback Profile (persisted)
  const [calibration, setCalibration] = useState<AlgorithmCalibrationProfile>(() => {
    try {
      const stored = localStorage.getItem(CALIBRATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_CALIBRATION_PROFILE;
    } catch {
      return DEFAULT_CALIBRATION_PROFILE;
    }
  });

  // Save calibration on change
  useEffect(() => {
    try {
      localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(calibration));
    } catch (e) {
      console.error('Failed to save calibration profile:', e);
    }
  }, [calibration]);

  // Calibration feedback actions
  const handleAddCalibrationDraw = (draw: Omit<CalibrationDrawEntry, 'id' | 'addedAt'>) => {
    const newEntry: CalibrationDrawEntry = {
      ...draw,
      id: `calib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      addedAt: new Date().toISOString(),
    };
    const updatedHistory = [newEntry, ...calibration.history];
    const newProfile = calculateCalibrationProfile(updatedHistory);
    setCalibration(newProfile);
  };

  const handleRemoveCalibrationDraw = (id: string) => {
    const updatedHistory = calibration.history.filter((h) => h.id !== id);
    const newProfile = calculateCalibrationProfile(updatedHistory);
    setCalibration(newProfile);
  };

  const handleResetCalibration = () => {
    setCalibration(DEFAULT_CALIBRATION_PROFILE);
    try {
      localStorage.removeItem(CALIBRATION_STORAGE_KEY);
    } catch {}
  };

  const handleOpenCalibratorWithDraw = (draw: OfficialDrawResult) => {
    setIsOfficialDrawsOpen(false);
    handleAddCalibrationDraw({
      game: draw.game,
      drawDate: draw.drawDate,
      whiteBalls: draw.whiteBalls,
      bonusBall: draw.bonusBall,
      source: draw.source,
    });
    setIsCalibratorOpen(true);
  };

  // Handle custom jackpot edits
  const handleUpdateJackpot = (game: 'megamillions' | 'powerball', amount: number) => {
    setRealJackpots((prev) => {
      const cashRatio = game === 'powerball' ? 0.4268 : 0.4234;
      const cashVal = Math.round(amount * cashRatio);
      return {
        ...prev,
        [game]: {
          ...prev[game],
          advertisedAmount: amount,
          cashValue: cashVal,
          advertisedFormatted: formatJackpotCurrency(amount),
          cashFormatted: formatJackpotCurrency(cashVal),
          lastUpdated: 'Custom Adjusted',
        },
      };
    });
  };

  const handleOpenWealthCalc = (game?: 'megamillions' | 'powerball') => {
    const selected = game || (activeGameFilter === 'megamillions' ? 'megamillions' : 'powerball');
    setCalcJackpotAmount(realJackpots[selected].advertisedAmount);
    setCalcGame(selected);
    setIsWealthCalcOpen(true);
  };

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTickets));
    } catch (e) {
      console.error('Failed to save tickets to localStorage:', e);
    }
  }, [savedTickets]);

  // Ticket Generation Routine
  const handleGenerate = useCallback(() => {
    setIsGenerating(true);

    const generated: LotteryTicket[] = [];
    const gamesToGenerate: ('megamillions' | 'powerball')[] =
      activeGameFilter === 'both'
        ? ['megamillions', 'powerball']
        : [activeGameFilter];

    for (const game of gamesToGenerate) {
      for (let i = 0; i < ticketSpreadCount; i++) {
        const ticket = generateQuantumTicket(
          game,
          drawDate,
          weather,
          market,
          luckySettings,
          i,
          calibration
        );
        generated.push(ticket);
      }
    }

    // Brief simulation delay for smooth UX feedback
    setTimeout(() => {
      setTickets(generated);
      setIsGenerating(false);

      // Smooth scroll to results
      const resultsEl = document.getElementById('results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 280);
  }, [activeGameFilter, drawDate, weather, market, luckySettings, ticketSpreadCount, calibration]);

  // Initial draw on mount
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  // Vault Actions
  const handleSaveTicket = (ticket: LotteryTicket) => {
    if (!savedTickets.some((t) => t.id === ticket.id)) {
      setSavedTickets((prev) => [ticket, ...prev]);
    } else {
      setSavedTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    }
  };

  const handleSaveAllTickets = () => {
    const newItems = tickets.filter(
      (t) => !savedTickets.some((saved) => saved.id === t.id)
    );
    if (newItems.length > 0) {
      setSavedTickets((prev) => [...newItems, ...prev]);
    }
  };

  const handleRemoveSavedTicket = (id: string) => {
    setSavedTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearVault = () => {
    if (window.confirm('Clear all saved tickets from your vault?')) {
      setSavedTickets([]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Universal 3-Zone Header */}
      <Header
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenWealthCalculator={() => handleOpenWealthCalc()}
        onOpenOfficialDraws={() => setIsOfficialDrawsOpen(true)}
        onOpenCalibrator={() => setIsCalibratorOpen(true)}
        onTriggerGenerate={handleGenerate}
        vaultCount={savedTickets.length}
        isCalibrated={calibration.isCalibrated}
        calibratedDrawCount={calibration.totalDrawsTrained}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero & Intent Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>Harmonic Thermodynamic Lottery Oracle</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-serif-display leading-tight">
            Quantum Lottery Prediction Engine
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Synthesizing barometric isobar lift, air thermal density, wind velocity shear, 
            solar luminosity, draw date harmonics, Wall Street liquidity momentum, and your personal lucky numbers.
          </p>
        </div>

        {/* Live Jackpots Prize Board */}
        <section id="games-overview" aria-label="Official Jackpots">
          <JackpotBanner
            onSelectGame={(g) => {
              setActiveGameFilter(g);
              // Trigger regeneration when game selection changes
              setTimeout(handleGenerate, 50);
            }}
            activeGame={activeGameFilter}
            onOpenWealthCalculator={handleOpenWealthCalc}
            onOpenOfficialDraws={() => setIsOfficialDrawsOpen(true)}
            onOpenCalibrator={() => setIsCalibratorOpen(true)}
            isCalibrated={calibration.isCalibrated}
            jackpots={realJackpots}
            onUpdateJackpot={handleUpdateJackpot}
          />
        </section>

        {/* Interactive Synthesis Parameter Tuning */}
        <section className="space-y-6" aria-label="Prediction Parameters">
          {/* Lucky Numbers Field (Requested directly by user) */}
          <LuckyNumbersInput
            settings={luckySettings}
            onChange={(newSettings) => {
              setLuckySettings(newSettings);
            }}
          />

          {/* Environmental Controls (Temperature, Pressure, Wind, Sunny/Cloudy) */}
          <WeatherControls
            weather={weather}
            onChange={(newWeather) => {
              setWeather(newWeather);
            }}
          />

          {/* Date of the Draw and Stock Market Performance */}
          <MarketAndDateControls
            market={market}
            onMarketChange={(newMarket) => {
              setMarket(newMarket);
            }}
            drawDate={drawDate}
            onDrawDateChange={(newDate) => {
              setDrawDate(newDate);
            }}
          />
        </section>

        {/* Action Trigger Banner */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-amber-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-center sm:text-left">
            <h3 className="text-base font-bold text-white font-serif-display">
              Ready to Synthesize Numbers
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              All atmospheric metrics, Wall Street liquidity vectors, and lucky resonances are aligned.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Game Filter Toggle */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveGameFilter('both');
                  setTimeout(handleGenerate, 50);
                }}
                className={`px-3 py-1.5 font-medium rounded transition-colors ${
                  activeGameFilter === 'both' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Both Games
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveGameFilter('megamillions');
                  setTimeout(handleGenerate, 50);
                }}
                className={`px-3 py-1.5 font-medium rounded transition-colors ${
                  activeGameFilter === 'megamillions' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Mega Millions
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveGameFilter('powerball');
                  setTimeout(handleGenerate, 50);
                }}
                className={`px-3 py-1.5 font-medium rounded transition-colors ${
                  activeGameFilter === 'powerball' ? 'bg-red-500 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Powerball
              </button>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 font-bold text-sm rounded-lg shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>{isGenerating ? 'Synthesizing Matrix...' : 'Generate Official Numbers'}</span>
            </button>
          </div>
        </div>

        {/* Results Output Section */}
        <section aria-label="Generated Lottery Results">
          <ResultsDisplay
            tickets={tickets}
            isGenerating={isGenerating}
            onSaveTicket={handleSaveTicket}
            onSaveAllTickets={handleSaveAllTickets}
            savedTicketIds={savedTickets.map((t) => t.id)}
            activeGameFilter={activeGameFilter}
            ticketSpreadCount={ticketSpreadCount}
            onChangeSpreadCount={(count) => {
              setTicketSpreadCount(count);
              setTimeout(handleGenerate, 50);
            }}
            onRegenerate={handleGenerate}
            onCheckMatches={() => setIsOfficialDrawsOpen(true)}
            onOpenCalibrator={() => setIsCalibratorOpen(true)}
            isCalibrated={calibration.isCalibrated}
            calibratedDrawCount={calibration.totalDrawsTrained}
          />
        </section>

        {/* Informative Disclaimer & Quantum Physics Context */}
        <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/40 p-5 text-xs text-neutral-400 space-y-2">
          <div className="flex items-center gap-2 text-neutral-300 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Mathematical & Aerodynamic Methodology Note</span>
          </div>
          <p className="leading-relaxed">
            Lottery machines operate using pneumatic air blowing mechanisms (such as the Smartplay Halogen and Magnum systems) 
            where lightweight celluloid balls (~2.70 grams) circulate in high-velocity turbulent vortexes. 
            This application uses deterministic thermodynamic modeling and chaotic sensitivity analysis to compute potential 
            harmonic convergence points based on real ambient temperature, barometric pressure, wind turbulence, draw day chronometry, 
            market liquidity momentum, and user-specified lucky numbers. Lottery draws remain statistically random games of chance; 
            please play responsibly.
          </p>
        </div>
      </main>

      {/* Footer adhering strictly to Anti-Slop constitution */}
      <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-display font-bold text-neutral-300">AuraBall</span>
            <span>·</span>
            <span>Quantum Thermodynamic Lottery Oracle</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              type="button" 
              onClick={() => setIsCalibratorOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Algorithm Calibrator {calibration.isCalibrated && `(${calibration.totalDrawsTrained})`}
            </button>
            <button 
              type="button" 
              onClick={() => setIsWealthCalcOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Jackpot Payout Calculator
            </button>
            <button 
              type="button" 
              onClick={() => setIsVaultOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Ticket Vault ({savedTickets.length})
            </button>
            <span>·</span>
            <span>Official Rules: 18+ / 21+ Depends on State</span>
          </div>
        </div>
      </footer>

      {/* Ticket Vault Modal */}
      <TicketVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        savedTickets={savedTickets}
        onRemoveTicket={handleRemoveSavedTicket}
        onClearAll={handleClearVault}
      />

      {/* Real Numbers & Official Draws Modal */}
      <OfficialDrawsModal
        isOpen={isOfficialDrawsOpen}
        onClose={() => setIsOfficialDrawsOpen(false)}
        userTickets={tickets}
        onOpenCalibratorWithDraw={handleOpenCalibratorWithDraw}
      />

      {/* Wealth & Payout Calculator Modal */}
      <WealthCalculatorModal
        isOpen={isWealthCalcOpen}
        onClose={() => setIsWealthCalcOpen(false)}
        initialJackpot={calcJackpotAmount}
        initialGame={calcGame}
      />

      {/* Algorithm Calibrator & Loss Feedback Loop Modal */}
      <AlgorithmCalibratorModal
        isOpen={isCalibratorOpen}
        onClose={() => setIsCalibratorOpen(false)}
        calibration={calibration}
        onAddCalibrationDraw={handleAddCalibrationDraw}
        onRemoveCalibrationDraw={handleRemoveCalibrationDraw}
        onResetCalibration={handleResetCalibration}
        onTriggerGenerate={handleGenerate}
      />
    </div>
  );
}
