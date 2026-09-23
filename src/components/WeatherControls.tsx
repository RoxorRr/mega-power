/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WeatherCondition, WeatherData } from '../types/lottery';
import { 
  CloudSun, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Gauge, 
  Thermometer, 
  MapPin, 
  Search, 
  Loader2,
  Compass
} from 'lucide-react';
import { fetchLiveWeather, searchCityCoordinates, WEATHER_PRESETS } from '../utils/weatherService';

interface WeatherControlsProps {
  weather: WeatherData;
  onChange: (data: WeatherData) => void;
}

export const WeatherControls: React.FC<WeatherControlsProps> = ({
  weather,
  onChange,
}) => {
  const [unitCelsius, setUnitCelsius] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Conversion helpers
  const displayTemp = unitCelsius
    ? Math.round(((weather.temperatureF - 32) * 5) / 9)
    : Math.round(weather.temperatureF);

  const handleTempChange = (val: number) => {
    const fahrenheit = unitCelsius ? (val * 9) / 5 + 32 : val;
    onChange({ ...weather, temperatureF: Math.round(fahrenheit * 10) / 10 });
  };

  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoadingLive(true);
    setStatusMessage('Acquiring atmospheric telemetry from local satellites...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const liveData = await fetchLiveWeather(
            pos.coords.latitude,
            pos.coords.longitude,
            'Local Atmospheric Reading'
          );
          onChange(liveData);
          setStatusMessage(`Synchronized with local coordinates (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`);
        } catch (err) {
          console.error(err);
          setStatusMessage('Could not retrieve live weather. Using current values.');
        } finally {
          setIsLoadingLive(false);
          setTimeout(() => setStatusMessage(null), 4000);
        }
      },
      (err) => {
        setIsLoadingLive(false);
        setStatusMessage('Location permission declined. Search for a city below instead.');
        setTimeout(() => setStatusMessage(null), 4000);
      },
      { timeout: 8000 }
    );
  };

  const handleCitySearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;

    setIsLoadingLive(true);
    setStatusMessage(`Searching atmospheric grid for "${citySearch}"...`);
    try {
      const geo = await searchCityCoordinates(citySearch.trim());
      if (geo) {
        const liveData = await fetchLiveWeather(geo.lat, geo.lon, geo.name);
        onChange(liveData);
        setStatusMessage(`Loaded live atmospheric metrics for ${geo.name}`);
        setCitySearch('');
      } else {
        setStatusMessage(`City "${citySearch}" not found. Try another city name.`);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to fetch weather for this city.');
    } finally {
      setIsLoadingLive(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const skyConditions: { id: WeatherCondition; label: string; icon: React.ReactNode }[] = [
    { id: 'sunny', label: 'Sunny / Clear', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { id: 'partly_cloudy', label: 'Partly Cloudy', icon: <CloudSun className="w-4 h-4 text-amber-200" /> },
    { id: 'cloudy', label: 'Overcast / Cloudy', icon: <Cloud className="w-4 h-4 text-neutral-300" /> },
    { id: 'rainy', label: 'Precipitation / Rain', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
    { id: 'stormy', label: 'Squall / Thunderstorm', icon: <CloudLightning className="w-4 h-4 text-purple-400" /> },
  ];

  return (
    <div id="environmental-tuning" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Atmospheric & Environmental Factors</h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Aerodynamic air density, barometric lift, and turbulence dynamics inside the lottery ball chamber.
          </p>
        </div>

        {/* Live Weather Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFetchCurrentLocation}
            disabled={isLoadingLive}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isLoadingLive ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Detect My Weather</span>
          </button>
        </div>
      </div>

      {/* City Search Bar & Location Badge */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <form onSubmit={handleCitySearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Search city (e.g. New York, Miami)..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
        </form>

        <div className="flex items-center gap-2 text-xs text-neutral-400 w-full sm:w-auto justify-end">
          <Compass className="w-3.5 h-3.5 text-neutral-500" />
          <span className="truncate max-w-[240px] text-neutral-300 font-medium">{weather.locationName}</span>
        </div>
      </div>

      {statusMessage && (
        <div className="mt-2 text-xs text-amber-300/90 bg-amber-500/10 px-3 py-1.5 rounded border border-amber-500/20">
          {statusMessage}
        </div>
      )}

      {/* Atmospheric Presets */}
      <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] text-neutral-500 whitespace-nowrap shrink-0">Presets:</span>
        {WEATHER_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.data)}
            className="px-2.5 py-1 text-[11px] font-medium bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded whitespace-nowrap shrink-0 transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Parameter Controls Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Air Temperature */}
        <div className="bg-neutral-950/70 p-4 rounded-xl border border-neutral-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              Air Temperature
            </span>
            <div className="flex items-center bg-neutral-900 rounded p-0.5 border border-neutral-800 text-[10px]">
              <button
                type="button"
                onClick={() => setUnitCelsius(false)}
                className={`px-1.5 py-0.5 rounded font-mono ${!unitCelsius ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'}`}
              >
                °F
              </button>
              <button
                type="button"
                onClick={() => setUnitCelsius(true)}
                className={`px-1.5 py-0.5 rounded font-mono ${unitCelsius ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'}`}
              >
                °C
              </button>
            </div>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-tabular text-white">
              {displayTemp}°{unitCelsius ? 'C' : 'F'}
            </span>
            <span className="text-[11px] text-neutral-500">
              {weather.temperatureF < 45 ? 'Cold & Dense Air' : weather.temperatureF > 85 ? 'Hot Kinetic Expansion' : 'Standard Room Equilibrium'}
            </span>
          </div>

          <input
            type="range"
            min={unitCelsius ? -20 : 0}
            max={unitCelsius ? 50 : 120}
            step={1}
            value={displayTemp}
            onChange={(e) => handleTempChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Air Pressure */}
        <div className="bg-neutral-950/70 p-4 rounded-xl border border-neutral-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              Barometric Air Pressure
            </span>
            <span className="text-[11px] font-mono-tabular text-neutral-500">
              {(weather.pressureHpa * 0.02953).toFixed(2)} inHg
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-tabular text-white">
              {weather.pressureHpa.toFixed(1)} <span className="text-sm font-normal text-neutral-400">hPa</span>
            </span>
            <span className="text-[11px] text-neutral-500">
              {weather.pressureHpa < 1005 ? 'Low (Buoyant Lift)' : weather.pressureHpa > 1020 ? 'High (Compressed Drag)' : 'Standard (1013.25)'}
            </span>
          </div>

          <input
            type="range"
            min={960}
            max={1050}
            step={0.5}
            value={weather.pressureHpa}
            onChange={(e) => onChange({ ...weather, pressureHpa: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
          />
        </div>

        {/* Wind Speed */}
        <div className="bg-neutral-950/70 p-4 rounded-xl border border-neutral-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              Wind Velocity & Draft
            </span>
            <span className="text-[11px] font-mono-tabular text-neutral-500">
              {(weather.windSpeedMph * 1.609).toFixed(1)} km/h
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-tabular text-white">
              {weather.windSpeedMph.toFixed(1)} <span className="text-sm font-normal text-neutral-400">mph</span>
            </span>
            <span className="text-[11px] text-neutral-500">
              {weather.windSpeedMph < 5 ? 'Laminar Still' : weather.windSpeedMph > 20 ? 'High Turbulent Shear' : 'Gentle Ventilation'}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={60}
            step={0.5}
            value={weather.windSpeedMph}
            onChange={(e) => onChange({ ...weather, windSpeedMph: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Sky Condition (Sunny vs Cloudy) */}
      <div className="mt-5">
        <label className="block text-xs font-medium text-neutral-400 mb-2">
          Sky Condition & Cloud Opacity (Photonic & Electrostatic Flux)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {skyConditions.map((cond) => {
            const isSelected = weather.condition === cond.id;
            return (
              <button
                key={cond.id}
                type="button"
                onClick={() => onChange({ ...weather, condition: cond.id })}
                className={`
                  flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all
                  ${isSelected 
                    ? 'bg-neutral-800 border-amber-500/60 text-white shadow-xs' 
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'}
                `}
              >
                {cond.icon}
                <span className="truncate">{cond.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
