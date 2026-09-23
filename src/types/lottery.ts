/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameType = 'megamillions' | 'powerball' | 'both';

export type WeatherCondition = 
  | 'sunny' 
  | 'partly_cloudy' 
  | 'cloudy' 
  | 'overcast' 
  | 'rainy' 
  | 'stormy';

export interface WeatherData {
  temperatureF: number;
  pressureHpa: number;
  windSpeedMph: number;
  condition: WeatherCondition;
  humidityPercent?: number;
  locationName: string;
}

export type MarketRegime = 'bull' | 'bear' | 'neutral' | 'volatile';

export interface MarketData {
  sp500ChangePercent: number;
  sp500Level: number;
  dowChangePercent: number;
  dowLevel: number;
  nasdaqChangePercent: number;
  nasdaqLevel: number;
  vix: number;
  regime: MarketRegime;
}

export interface LuckyNumberSettings {
  numbers: number[];
  mode: 'harmonic_weight' | 'anchor_lock';
}

export interface DrawAttribution {
  temperatureVector: string;
  pressureLiftIndex: string;
  windTurbulenceDelta: string;
  skySolarVariance: string;
  marketMomentumSkew: string;
  luckyResonanceFactor: string;
  calibrationOffset?: string;
  entropySeedHex: string;
}

export interface LotteryTicket {
  id: string;
  game: 'megamillions' | 'powerball';
  drawDate: string;
  whiteBalls: number[];
  bonusBall: number;
  multiplier: number;
  multiplierLabel: string; // 'Megaplier 3X' or 'Power Play 3X'
  attribution: DrawAttribution;
  generatedAt: string;
}

export interface LotteryGameConfig {
  name: string;
  title: string;
  whiteBallCount: number;
  whiteBallMax: number;
  bonusBallName: string;
  bonusBallMax: number;
  drawScheduleDays: string;
  currentEstimatedJackpot: string;
  cashValue: string;
  accentColor: string;
}

export interface OfficialDrawResult {
  id: string;
  game: 'megamillions' | 'powerball';
  drawDate: string;
  whiteBalls: number[];
  bonusBall: number;
  multiplier?: string;
  doublePlayBalls?: number[];
  source: string;
}

export interface RealJackpotInfo {
  game: 'megamillions' | 'powerball';
  advertisedAmount: number;
  cashValue: number;
  advertisedFormatted: string;
  cashFormatted: string;
  nextDrawDate: string;
  drawTime: string;
  isRollover: boolean;
  lastUpdated: string;
  source: string;
}

export interface TicketMatchResult {
  ticketId: string;
  whiteMatches: number[];
  matchedWhiteCount: number;
  bonusMatched: boolean;
  prizeEstimate: string;
  isJackpotWinner: boolean;
}

export interface CalibrationDrawEntry {
  id: string;
  game: 'megamillions' | 'powerball';
  drawDate: string;
  whiteBalls: number[];
  bonusBall: number;
  addedAt: string;
  source: string;
}

export interface AlgorithmCalibrationProfile {
  lastUpdated: string;
  totalDrawsTrained: number;
  isCalibrated: boolean;
  history: CalibrationDrawEntry[];
  // Derived correction factors
  lowDecileOffset: number;    // Multiplier for balls 1-25 (e.g. +0.08)
  midDecileOffset: number;    // Multiplier for balls 26-50 (e.g. -0.04)
  highDecileOffset: number;   // Multiplier for balls 51-70 (e.g. +0.02)
  oddParityFactor: number;    // Odd/Even balance adjustment (-0.1 to +0.1)
  primeHarmonicShift: number; // Prime number resonance adjustment
  bonusBallAffinities: Record<number, number>; // Bonus ball adjustments
  frequencyResiduals: Record<number, number>;  // Ball-specific frequency dampening/boosting
  summaryNotes: string[];
}

