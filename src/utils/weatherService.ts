/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherCondition, WeatherData } from '../types/lottery';

export interface WeatherPreset {
  id: string;
  name: string;
  location: string;
  description: string;
  data: WeatherData;
}

export const WEATHER_PRESETS: WeatherPreset[] = [
  {
    id: 'vegas_heat',
    name: 'Las Vegas Strip (Heat & Dry)',
    location: 'Las Vegas, NV',
    description: 'Blistering 96°F, low barometric density, calm winds',
    data: {
      temperatureF: 96,
      pressureHpa: 998,
      windSpeedMph: 4.5,
      condition: 'sunny',
      humidityPercent: 12,
      locationName: 'Las Vegas, NV (Casino Corridor)',
    },
  },
  {
    id: 'wall_st_storm',
    name: 'Wall Street Gale (Autumn Frost)',
    location: 'New York, NY',
    description: 'Chilly 48°F, high pressure 1024 hPa, 22 mph wind gusts',
    data: {
      temperatureF: 48,
      pressureHpa: 1024,
      windSpeedMph: 22.0,
      condition: 'rainy',
      humidityPercent: 82,
      locationName: 'New York, NY (Financial District)',
    },
  },
  {
    id: 'calm_standard',
    name: 'Equatorial Equilibrium (STP)',
    location: 'Honolulu, HI',
    description: 'Optimal 74°F, standard 1013.25 hPa, 9 mph trade breeze',
    data: {
      temperatureF: 74,
      pressureHpa: 1013.25,
      windSpeedMph: 9.0,
      condition: 'partly_cloudy',
      humidityPercent: 55,
      locationName: 'Honolulu, HI (Trade Winds)',
    },
  },
  {
    id: 'tornado_vortex',
    name: 'Midwest Low-Pressure Vortex',
    location: 'Oklahoma City, OK',
    description: '79°F, intense barometric drop 985 hPa, 32 mph wind shear',
    data: {
      temperatureF: 79,
      pressureHpa: 985,
      windSpeedMph: 32.0,
      condition: 'stormy',
      humidityPercent: 88,
      locationName: 'Oklahoma City, OK (Squall Line)',
    },
  },
  {
    id: 'monaco_sun',
    name: 'Monaco Monte Carlo (Golden Sun)',
    location: 'Monte Carlo, Monaco',
    description: '81°F Mediterranean high sun, 1017 hPa, gentle sea breeze',
    data: {
      temperatureF: 81,
      pressureHpa: 1017,
      windSpeedMph: 6.2,
      condition: 'sunny',
      humidityPercent: 44,
      locationName: 'Monte Carlo, Monaco (Grand Casino)',
    },
  },
];

/**
 * Maps Open-Meteo weather code (WMO) to our WeatherCondition
 */
function mapWmoToCondition(code: number): WeatherCondition {
  if (code === 0) return 'sunny';
  if (code === 1 || code === 2) return 'partly_cloudy';
  if (code === 3) return 'overcast';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 95) return 'stormy';
  return 'cloudy';
}

/**
 * Fetches real weather from Open-Meteo free API
 */
export async function fetchLiveWeather(lat: number, lon: number, locationName: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo error: ${response.statusText}`);
  }
  
  const data = await response.json();
  const current = data.current;

  return {
    temperatureF: Math.round((current.temperature_2m ?? 72) * 10) / 10,
    pressureHpa: Math.round((current.surface_pressure ?? 1013) * 10) / 10,
    windSpeedMph: Math.round((current.wind_speed_10m ?? 7) * 10) / 10,
    humidityPercent: current.relative_humidity_2m ?? 50,
    condition: mapWmoToCondition(current.weather_code ?? 0),
    locationName,
  };
}

/**
 * Geocodes a city name to coordinates using Open-Meteo Geocoding API
 */
export async function searchCityCoordinates(cityName: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;
    const res = data.results[0];
    const country = res.country ? `, ${res.country}` : '';
    const admin = res.admin1 ? ` (${res.admin1})` : '';
    return {
      lat: res.latitude,
      lon: res.longitude,
      name: `${res.name}${admin}${country}`,
    };
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
}
