/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AlgorithmCalibrationProfile,
  CalibrationDrawEntry,
  DrawAttribution,
  GameType,
  LotteryGameConfig,
  LotteryTicket,
  LuckyNumberSettings,
  MarketData,
  WeatherData,
} from '../types/lottery';

export const GAME_CONFIGS: Record<'megamillions' | 'powerball', LotteryGameConfig> = {
  megamillions: {
    name: 'Mega Millions',
    title: 'Mega Millions® Quantum Matrix',
    whiteBallCount: 5,
    whiteBallMax: 70,
    bonusBallName: 'Mega Ball',
    bonusBallMax: 25,
    drawScheduleDays: 'Tuesdays & Fridays (11:00 PM ET)',
    currentEstimatedJackpot: '$277,000,000',
    cashValue: '$117,300,000',
    accentColor: '#eab308', // Gold
  },
  powerball: {
    name: 'Powerball',
    title: 'Powerball® Atmospheric Engine',
    whiteBallCount: 5,
    whiteBallMax: 69,
    bonusBallName: 'Powerball',
    bonusBallMax: 26,
    drawScheduleDays: 'Mondays, Wednesdays & Saturdays (10:59 PM ET)',
    currentEstimatedJackpot: '$332,000,000',
    cashValue: '$141,700,000',
    accentColor: '#ef4444', // Red
  },
};

/**
 * 64-bit MurmurHash3 variant string hasher to generate deterministic seed
 */
function hashStringToNumber(str: string): number {
  let h = 0xdeadbeef;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Deterministic Pseudo-Random Generator (SplitMix32)
 */
class DeterministicPRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
    if (this.state === 0) this.state = 0x85ebca6b;
  }

  next(): number {
    this.state = (this.state + 0x9e3779b9) >>> 0;
    let z = this.state;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
  }
}

/**
 * Calculates next upcoming official draw date for a game
 */
export function getNextDrawDate(game: 'megamillions' | 'powerball', fromDate: Date = new Date()): Date {
  const date = new Date(fromDate);
  // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  const currentDay = date.getDay();
  let daysUntilDraw = 0;

  if (game === 'megamillions') {
    // Draws on Tuesday (2) and Friday (5)
    if (currentDay === 2) {
      daysUntilDraw = 0;
    } else if (currentDay < 2) {
      daysUntilDraw = 2 - currentDay;
    } else if (currentDay <= 5) {
      daysUntilDraw = 5 - currentDay;
    } else {
      daysUntilDraw = 2 + (7 - currentDay);
    }
  } else {
    // Powerball draws on Monday (1), Wednesday (3), Saturday (6)
    if (currentDay === 1 || currentDay === 3 || currentDay === 6) {
      daysUntilDraw = 0;
    } else if (currentDay < 1) {
      daysUntilDraw = 1;
    } else if (currentDay < 3) {
      daysUntilDraw = 3 - currentDay;
    } else if (currentDay < 6) {
      daysUntilDraw = 6 - currentDay;
    } else {
      daysUntilDraw = 2; // From Sunday to Monday is 1, from Sat is next week Mon (2 days)
    }
  }

  const nextDraw = new Date(date);
  nextDraw.setDate(date.getDate() + daysUntilDraw);
  return nextDraw;
}

/**
 * Synthesizes atmospheric, date, stock market, lucky numbers, and calibration data into tickets
 */
export function generateQuantumTicket(
  game: 'megamillions' | 'powerball',
  drawDateStr: string,
  weather: WeatherData,
  market: MarketData,
  luckySettings: LuckyNumberSettings,
  ticketIndex: number = 0,
  calibration?: AlgorithmCalibrationProfile | null
): LotteryTicket {
  const config = GAME_CONFIGS[game];

  // 1. Build composite deterministic entropy seed string
  const entropySeedSource = [
    game,
    drawDateStr,
    `temp:${weather.temperatureF.toFixed(2)}`,
    `press:${weather.pressureHpa.toFixed(2)}`,
    `wind:${weather.windSpeedMph.toFixed(2)}`,
    `sky:${weather.condition}`,
    `sp500:${market.sp500ChangePercent.toFixed(2)}`,
    `dow:${market.dowChangePercent.toFixed(2)}`,
    `nasdaq:${market.nasdaqChangePercent.toFixed(2)}`,
    `vix:${market.vix.toFixed(2)}`,
    `lucky:${luckySettings.numbers.join(',')}`,
    `mode:${luckySettings.mode}`,
    `calib:${calibration ? calibration.totalDrawsTrained : 0}`,
    `idx:${ticketIndex}`,
  ].join('|');

  const seed = hashStringToNumber(entropySeedSource);
  const prng = new DeterministicPRNG(seed);
  const seedHex = '0x' + seed.toString(16).toUpperCase().padStart(8, '0');

  // 2. Compute physics and market harmonic weights for each ball (1 to max)
  const weights: number[] = new Array(config.whiteBallMax + 1).fill(0);
  const tempNorm = (weather.temperatureF - 68) / 30; // normalized around standard room temp 68°F
  const pressureRatio = weather.pressureHpa / 1013.25;
  const windNorm = Math.min(weather.windSpeedMph / 25, 2.0);
  
  // Sky factor: sunny yields higher radiant excitation; overcast damps variance
  const skyFactor = 
    weather.condition === 'sunny' ? 1.25 :
    weather.condition === 'partly_cloudy' ? 1.05 :
    weather.condition === 'cloudy' ? 0.95 :
    weather.condition === 'rainy' ? 0.85 : 0.75;

  // Market momentum vector:
  const marketComposite = 
    (market.sp500ChangePercent * 0.45) + 
    (market.dowChangePercent * 0.3) + 
    (market.nasdaqChangePercent * 0.25);
  const vixInfluence = (market.vix - 15) / 10;

  for (let num = 1; num <= config.whiteBallMax; num++) {
    // Base uniform probability
    let w = 1.0;

    // Thermal buoyancy perturbation
    const thermalWave = Math.sin((num * Math.PI) / 12 + tempNorm * 2.1);
    w *= 1 + 0.32 * thermalWave;

    // Barometric pressure drag coefficient
    const pressureWave = Math.cos((num * Math.PI) / 18 * pressureRatio);
    w *= 1 + 0.28 * pressureWave;

    // Wind turbulence shear
    const turbulence = Math.sin(num * 0.41 * (1 + windNorm));
    w *= 1 + 0.25 * turbulence * windNorm;

    // Solar luminosity harmonic
    if (skyFactor > 1.0) {
      // Sunny: primes and upper numbers get elevated resonance
      if (isPrime(num)) w *= 1.22;
    } else {
      // Cloudy/Stormy: even clusters and lower-mid numbers stabilize
      if (num % 2 === 0) w *= 1.15;
    }

    // Market Momentum Skew
    if (marketComposite > 0) {
      // Bullish market: upward drift towards upper deciles
      const upperRatio = num / config.whiteBallMax;
      w *= 1 + 0.35 * marketComposite * upperRatio;
    } else {
      // Bearish market: defensive clustering around foundational numbers
      const lowerRatio = (config.whiteBallMax - num) / config.whiteBallMax;
      w *= 1 + 0.35 * Math.abs(marketComposite) * lowerRatio;
    }

    // VIX Volatility dispersion
    if (vixInfluence > 0) {
      // High volatility spreads odds to edge numbers
      const edgeDistance = Math.abs(num - config.whiteBallMax / 2) / (config.whiteBallMax / 2);
      w *= 1 + 0.2 * vixInfluence * edgeDistance;
    }

    // Lucky numbers weighting
    if (luckySettings.numbers.includes(num)) {
      if (luckySettings.mode === 'harmonic_weight') {
        w *= 4.5; // Massive gravitational pull in quantum field
      }
    }

    // Algorithmic calibration feedback adjustments
    if (calibration && calibration.totalDrawsTrained > 0) {
      if (num <= 25) {
        w *= (1 + calibration.lowDecileOffset);
      } else if (num <= 50) {
        w *= (1 + calibration.midDecileOffset);
      } else {
        w *= (1 + calibration.highDecileOffset);
      }

      if (num % 2 !== 0) {
        w *= (1 + calibration.oddParityFactor);
      }

      if (isPrime(num)) {
        w *= (1 + calibration.primeHarmonicShift);
      }

      if (calibration.frequencyResiduals && calibration.frequencyResiduals[num]) {
        w *= (1 + calibration.frequencyResiduals[num]);
      }
    }

    // Add subtle ticket-index variance to prevent identical lines in multi-ticket syndicate
    if (ticketIndex > 0) {
      const variantPhase = Math.sin(num * ticketIndex * 0.77);
      w *= 1 + 0.22 * variantPhase;
    }

    weights[num] = Math.max(0.01, w);
  }

  // 3. Select 5 distinct white balls
  const selectedWhiteBalls: number[] = [];

  // If anchor mode is active, lock in valid lucky numbers first (up to whiteBallCount - 1)
  if (luckySettings.mode === 'anchor_lock' && luckySettings.numbers.length > 0) {
    const validAnchors = luckySettings.numbers
      .filter((n) => n >= 1 && n <= config.whiteBallMax)
      .slice(0, config.whiteBallCount - 1);
    for (const anchor of validAnchors) {
      if (!selectedWhiteBalls.includes(anchor)) {
        selectedWhiteBalls.push(anchor);
      }
    }
  }

  // Fill remaining slots using weighted sampling without replacement
  while (selectedWhiteBalls.length < config.whiteBallCount) {
    // Sum weights of remaining candidates
    let totalWeight = 0;
    for (let num = 1; num <= config.whiteBallMax; num++) {
      if (!selectedWhiteBalls.includes(num)) {
        totalWeight += weights[num];
      }
    }

    let target = prng.next() * totalWeight;
    let chosen = -1;

    for (let num = 1; num <= config.whiteBallMax; num++) {
      if (selectedWhiteBalls.includes(num)) continue;
      target -= weights[num];
      if (target <= 0) {
        chosen = num;
        break;
      }
    }

    if (chosen === -1) {
      // fallback
      for (let num = 1; num <= config.whiteBallMax; num++) {
        if (!selectedWhiteBalls.includes(num)) {
          chosen = num;
          break;
        }
      }
    }

    selectedWhiteBalls.push(chosen);
  }

  // Sort white balls ascending (standard lottery format)
  selectedWhiteBalls.sort((a, b) => a - b);

  // 4. Select Bonus Ball (Mega Ball 1-25 or Powerball 1-26)
  const bonusWeights: number[] = new Array(config.bonusBallMax + 1).fill(0);
  for (let num = 1; num <= config.bonusBallMax; num++) {
    let bw = 1.0;
    // Harmonic resonance between game bonus pool and market/pressure
    const bonusResonance = Math.sin((num * Math.PI) / 6 + pressureRatio * 1.5 + marketComposite);
    bw *= 1 + 0.4 * bonusResonance;
    if (luckySettings.numbers.includes(num)) {
      bw *= 3.5;
    }
    if (calibration && calibration.bonusBallAffinities && calibration.bonusBallAffinities[num]) {
      bw *= (1 + calibration.bonusBallAffinities[num]);
    }
    bonusWeights[num] = Math.max(0.01, bw);
  }

  let totalBonusWeight = 0;
  for (let num = 1; num <= config.bonusBallMax; num++) {
    totalBonusWeight += bonusWeights[num];
  }

  let bonusTarget = prng.next() * totalBonusWeight;
  let bonusBall = 1;
  for (let num = 1; num <= config.bonusBallMax; num++) {
    bonusTarget -= bonusWeights[num];
    if (bonusTarget <= 0) {
      bonusBall = num;
      break;
    }
  }

  // 5. Multiplier selection
  // Mega Millions Megaplier: 2X, 3X, 4X, 5X
  // Powerball Power Play: 2X, 3X, 4X, 5X, 10X
  const multiplierChoices = game === 'powerball' ? [2, 3, 4, 5, 10] : [2, 3, 4, 5];
  const multIndex = Math.floor(prng.next() * multiplierChoices.length);
  const multiplier = multiplierChoices[multIndex];
  const multiplierLabel = game === 'powerball' ? `Power Play ${multiplier}X` : `Megaplier ${multiplier}X`;

  // 6. Detailed attribution calculations
  const attribution: DrawAttribution = {
    temperatureVector: `${weather.temperatureF > 75 ? '+' : ''}${((weather.temperatureF - 68) * 0.42).toFixed(1)}° thermal flux`,
    pressureLiftIndex: `${pressureRatio > 1 ? '+' : ''}${((pressureRatio - 1) * 100).toFixed(1)}% isobar delta`,
    windTurbulenceDelta: `${(weather.windSpeedMph * 0.73).toFixed(1)} kt kinetic shear`,
    skySolarVariance: `${weather.condition === 'sunny' ? 'High photon ionization' : weather.condition === 'rainy' ? 'Precipitation dampening' : 'Diffuse cloud dispersion'}`,
    marketMomentumSkew: `${marketComposite >= 0 ? '+' : ''}${marketComposite.toFixed(2)}% ${marketComposite >= 0 ? 'bull bias' : 'bear reversal'}`,
    luckyResonanceFactor: luckySettings.numbers.length > 0 
      ? `${luckySettings.numbers.length} harmonics engaged (${luckySettings.mode === 'anchor_lock' ? 'locked' : 'weighted'})` 
      : 'Pure atmospheric baseline',
    calibrationOffset: calibration && calibration.totalDrawsTrained > 0
      ? `Calibrated (${calibration.totalDrawsTrained} draws, ${calibration.lowDecileOffset >= 0 ? '+' : ''}${(calibration.lowDecileOffset * 100).toFixed(0)}% L, ${calibration.highDecileOffset >= 0 ? '+' : ''}${(calibration.highDecileOffset * 100).toFixed(0)}% H, ${calibration.oddParityFactor >= 0 ? '+' : ''}${(calibration.oddParityFactor * 100).toFixed(0)}% Parity)`
      : undefined,
    entropySeedHex: seedHex,
  };

  return {
    id: `${game}-${Date.now()}-${ticketIndex}-${seedHex.slice(2, 6)}`,
    game,
    drawDate: drawDateStr,
    whiteBalls: selectedWhiteBalls,
    bonusBall,
    multiplier,
    multiplierLabel,
    attribution,
    generatedAt: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

export const DEFAULT_CALIBRATION_PROFILE: AlgorithmCalibrationProfile = {
  lastUpdated: 'Baseline Theoretical Physics',
  totalDrawsTrained: 0,
  isCalibrated: false,
  history: [],
  lowDecileOffset: 0,
  midDecileOffset: 0,
  highDecileOffset: 0,
  oddParityFactor: 0,
  primeHarmonicShift: 0,
  bonusBallAffinities: {},
  frequencyResiduals: {},
  summaryNotes: ['Running on uncalibrated theoretical physics baseline.'],
};

/**
 * Calculates algorithmic backpropagation and residual corrections
 * from historical / user-provided actual winning numbers.
 */
export function calculateCalibrationProfile(history: CalibrationDrawEntry[]): AlgorithmCalibrationProfile {
  if (!history || history.length === 0) {
    return DEFAULT_CALIBRATION_PROFILE;
  }

  const n = history.length;
  let lowCount = 0;   // 1 - 25
  let midCount = 0;   // 26 - 50
  let highCount = 0;  // 51 - 70
  let oddCount = 0;
  let primeCount = 0;

  const frequencyResiduals: Record<number, number> = {};
  const bonusBallAffinities: Record<number, number> = {};

  history.forEach((draw) => {
    // Bonus ball counts
    if (draw.bonusBall) {
      bonusBallAffinities[draw.bonusBall] = (bonusBallAffinities[draw.bonusBall] || 0) + 1;
    }

    draw.whiteBalls.forEach((b) => {
      // Frequency residual
      frequencyResiduals[b] = (frequencyResiduals[b] || 0) + 1;

      // Decile tracking
      if (b <= 25) lowCount++;
      else if (b <= 50) midCount++;
      else highCount++;

      // Parity
      if (b % 2 !== 0) oddCount++;

      // Prime
      if (isPrime(b)) primeCount++;
    });
  });

  const totalBalls = n * 5;
  const actualLowRatio = lowCount / totalBalls;
  const actualMidRatio = midCount / totalBalls;
  const actualHighRatio = highCount / totalBalls;
  const actualOddRatio = oddCount / totalBalls;
  const actualPrimeRatio = primeCount / totalBalls;

  // Expected uniform proportions
  // Low (1-25 out of ~70) ~ 35.7%
  // Mid (26-50 out of ~70) ~ 35.7%
  // High (51-70 out of ~70) ~ 28.6%
  const lowDecileOffset = Math.max(-0.35, Math.min(0.4, (actualLowRatio - 0.357) * 1.6));
  const midDecileOffset = Math.max(-0.35, Math.min(0.4, (actualMidRatio - 0.357) * 1.6));
  const highDecileOffset = Math.max(-0.35, Math.min(0.4, (actualHighRatio - 0.286) * 1.6));

  // Odd parity adjustment (expected ~50%)
  const oddParityFactor = Math.max(-0.25, Math.min(0.25, (actualOddRatio - 0.5) * 1.2));

  // Prime resonance adjustment (expected 19 primes / 70 ~ 27.1%)
  const primeHarmonicShift = Math.max(-0.25, Math.min(0.25, (actualPrimeRatio - 0.271) * 1.2));

  // Normalize frequency residuals to multipliers (+0.1 to +0.3 per appearance ratio)
  const normalizedFreq: Record<number, number> = {};
  for (const [ballStr, count] of Object.entries(frequencyResiduals)) {
    const ball = parseInt(ballStr, 10);
    // Give empirical boost for frequent hits and slight local attractor effect
    normalizedFreq[ball] = Math.min(0.45, (count / n) * 0.35);
  }

  // Normalize bonus ball affinities
  const normalizedBonus: Record<number, number> = {};
  for (const [ballStr, count] of Object.entries(bonusBallAffinities)) {
    const ball = parseInt(ballStr, 10);
    normalizedBonus[ball] = Math.min(0.5, (count / n) * 0.4);
  }

  const summaryNotes: string[] = [
    `Learned from ${n} empirical draw${n > 1 ? 's' : ''}`,
    `Low Range (1-25) bias: ${lowDecileOffset >= 0 ? '+' : ''}${(lowDecileOffset * 100).toFixed(1)}%`,
    `Mid Range (26-50) bias: ${midDecileOffset >= 0 ? '+' : ''}${(midDecileOffset * 100).toFixed(1)}%`,
    `High Range (51-70) bias: ${highDecileOffset >= 0 ? '+' : ''}${(highDecileOffset * 100).toFixed(1)}%`,
    `Parity vector: ${oddParityFactor >= 0 ? '+' : ''}${(oddParityFactor * 100).toFixed(1)}% odd preference`,
  ];

  return {
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    totalDrawsTrained: n,
    isCalibrated: true,
    history,
    lowDecileOffset,
    midDecileOffset,
    highDecileOffset,
    oddParityFactor,
    primeHarmonicShift,
    bonusBallAffinities: normalizedBonus,
    frequencyResiduals: normalizedFreq,
    summaryNotes,
  };
}
