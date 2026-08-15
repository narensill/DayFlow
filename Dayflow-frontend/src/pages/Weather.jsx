import { useEffect, useState, useCallback } from 'react';
import { weatherApi } from '../api/weather';
import { settingsApi } from '../api/settings';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ErrorState, LoadingSkeletonLines } from '../components/States';
import { IconSearch, IconMapPin } from '../components/Icons';
import { weatherIcon } from '../utils/format';
import { formatDate } from '../utils/date';

export default function Weather() {
  const [city, setCity] = useState('');
  const [inputCity, setInputCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const containerRef = useScrollReveal([weather, loading]);

  const fetchWeather = useCallback((c) => {
    if (!c) return;
    setLoading(true);
    setError('');
    weatherApi
      .current(c)
      .then(setWeather)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    settingsApi.get().then((s) => {
      const loc = s.weatherLocation || 'Mumbai';
      setCity(loc);
      setInputCity(loc);
      fetchWeather(loc);
    }).catch(() => {
      setCity('Mumbai');
      setInputCity('Mumbai');
      fetchWeather('Mumbai');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setCity(inputCity.trim());
      fetchWeather(inputCity.trim());
    }
  };

  return (
    <div className="page" ref={containerRef}>
      <div className="page-header reveal">
        <div>
          <h1>Weather</h1>
          <p className="subtitle">Conditions to help you plan your day.</p>
        </div>
      </div>

      <form onSubmit={submitSearch} className="toolbar reveal">
        <div className="input-wrap search-box">
          <span className="input-icon"><IconMapPin width="16" height="16" /></span>
          <input className="input" placeholder="Search a city…" value={inputCity} onChange={(e) => setInputCity(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary btn-sm"><IconSearch width="15" height="15" /> Search</button>
      </form>

      {loading && (
        <div className="glass card reveal"><LoadingSkeletonLines lines={4} /></div>
      )}

      {error && !loading && <ErrorState message={error} onRetry={() => fetchWeather(city)} />}

      {!loading && !error && weather && (
        <div className="reveal">
          <div className="glass weather-card glass-interactive" style={{ maxWidth: 560 }}>
            <div className="weather-card__top">
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{weather.location}</div>
                <div className="weather-card__temp">{Math.round(weather.temperature)}°</div>
                <div className="text-muted">{weather.condition}</div>
              </div>
              <div className="weather-card__icon" style={{ fontSize: '4rem' }}>{weatherIcon(weather.weatherCode)}</div>
            </div>
            <div className="weather-card__meta">
              <span>Feels like {Math.round(weather.feelsLike)}°</span>
              <span>Humidity {weather.humidity}%</span>
              <span>Wind {Math.round(weather.windSpeed)} km/h</span>
            </div>

            {weather.forecast?.length > 0 && (
              <div className="weather-forecast-strip" style={{ marginTop: 22 }}>
                {weather.forecast.map((f) => (
                  <div className="forecast-day" key={f.date}>
                    <div className="fd-name">{formatDate(f.date).split(' ')[0]}</div>
                    <div className="fd-icon">{weatherIcon(f.weatherCode)}</div>
                    <div className="fd-temp">{Math.round(f.maxTemperature)}° <span className="lo">{Math.round(f.minTemperature)}°</span></div>
                    {f.precipitationProbability != null && (
                      <div className="text-dim" style={{ fontSize: '0.68rem', marginTop: 3 }}>{f.precipitationProbability}% rain</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
