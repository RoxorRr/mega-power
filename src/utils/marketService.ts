/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarketData, MarketRegime } from '../types/lottery';

export interface MarketPreset {
  id: string;
  name: string;
  regime: MarketRegime;
  description: string;
  data: MarketData;
}

export const MARKET_PRESETS: MarketPreset[] = [
  {
    id: 'bull_surge',
    name: 'Bull Market Surge',
    regime: 'bull',
    description: 'Broad institutional buying across tech & industrials',
    data: {
      sp500ChangePercent: 1.48,
      sp500Level: 5892.4,
      dowChangePercent: 0.95,
      dowLevel: 42520.1,
      nasdaqChangePercent: 2.12,
      nasdaqLevel: 18490.5,
      vix: 13.4,
      regime: 'bull',
    },
  },
  {
    id: 'bear_selloff',
    name: 'Bearish Risk-Off Liquidation',
    regime: 'bear',
    description: 'Macro rate headwinds triggering broad market retreat',
    data: {
      sp500ChangePercent: -1.75,
      sp500Level: 5712.2,
      dowChangePercent: -1.42,
      dowLevel: 41530.8,
      nasdaqChangePercent: -2.35,
      nasdaqLevel: 17680.0,
      vix: 25.8,
      regime: 'bear',
    },
  },
  {
    id: 'high_volatility',
    name: 'High Volatility Whip (VIX 32+)',
    regime: 'volatile',
    description: 'Extreme options hedging and erratic intraday swings',
    data: {
      sp500ChangePercent: 0.22,
      sp500Level: 5790.0,
      dowChangePercent: -0.65,
      dowLevel: 41850.0,
      nasdaqChangePercent: 0.85,
      nasdaqLevel: 18010.0,
      vix: 32.4,
      regime: 'volatile',
    },
  },
  {
    id: 'neutral_drift',
    name: 'Low-Vol Consolidation',
    regime: 'neutral',
    description: 'Sideways quiet consolidation ahead of economic prints',
    data: {
      sp500ChangePercent: 0.12,
      sp500Level: 5835.5,
      dowChangePercent: -0.05,
      dowLevel: 42180.2,
      nasdaqChangePercent: 0.18,
      nasdaqLevel: 18215.0,
      vix: 14.8,
      regime: 'neutral',
    },
  },
];
