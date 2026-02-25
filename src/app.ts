import { WeatherData, ForecastData, ForecastResponse, WeatherResponse, HourlyData } from './types';

const API_KEY = '757f7c0291760953b1051b6100356250';
const BASE    = 'https://api.openweathermap.org/data/2.5';
const GEO     = 'https://api.openweathermap.org/geo/1.0';

let useFahrenheit  = false;
let currentWeather : WeatherData    | null = null;
let currentForecast: ForecastData[] | null = null;
let currentHourly  : HourlyData[]   | null = null;
let clockTimer     : ReturnType<typeof setInterval> | null = null;
let debounceTimer  : ReturnType<typeof setTimeout>  | null = null;

interface GeoResult { name: string; country: string; state?: string; lat: number; lon: number; }

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

document.addEventListener('DOMContentLoaded', () => {

    const cityInput  = $<HTMLInputElement>('city-input');
    const searchForm = $<HTMLFormElement>('searchForm');
    const unitToggle = $<HTMLButtonElement>('unitToggle');
    const heroCard   = $<HTMLElement>('heroCard');
    const loader     = $<HTMLElement>('loader');
    const errorCard  = $<HTMLElement>('errorCard');

    // Autocomplete dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.id = 'autocomplete';
    const searchWrap = document.querySelector('.search-wrap');
    if (searchWrap) searchWrap.appendChild(dropdown);

    // Enhetsväxling
    unitToggle?.addEventListener('click', () => {
        useFahrenheit = !useFahrenheit;
        if (unitToggle) unitToggle.textContent = useFahrenheit ? '°F / °C' : '°C / °F';
        if (currentWeather) renderHero(currentWeather, currentForecast, currentHourly);
        document.querySelectorAll<HTMLElement>('.weather-box').forEach(box => {
            const rawTemp = parseFloat(box.dataset.tempC ?? '0');
            const rawFeel = parseFloat(box.dataset.feelC ?? '0');
            const u = useFahrenheit ? 'F' : 'C';
            const tempEl = box.querySelector('.weather-box__temp');
            const feelEl = box.querySelector('.weather-box__sub');
            if (tempEl) tempEl.textContent = `${convert(rawTemp)}°${u}`;
            if (feelEl) feelEl.textContent = `Känns som ${convert(rawFeel)}°${u}`;
        });
    });

    // Live-sökning
    cityInput?.addEventListener('input', () => {
        const q = cityInput.value.trim();
        if (debounceTimer) clearTimeout(debounceTimer);
        if (q.length < 2) { closeDropdown(); return; }
        debounceTimer = setTimeout(() => fetchAutocomplete(q), 280);
    });

    document.addEventListener('click', (e) => {
        if (!searchWrap?.contains(e.target as Node)) closeDropdown();
    });

    searchForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const city = cityInput?.value.trim() ?? '';
        closeDropdown();
        if (city) { localStorage.setItem('lastCity', city); await loadCity(city); }
    });

    const lastCity = localStorage.getItem('lastCity');
    if (lastCity && cityInput) { cityInput.value = lastCity; loadCity(lastCity); }

    const presetCities = ['Stockholm', 'New York', 'Tokyo', 'London', 'Sydney'];
    presetCities.forEach(async (city, i) => {
        const data = await fetchWeather(city);
        if (data) displayPreset(data, i);
    });

    function startClock(timezoneOffset: number): void {
        if (clockTimer) clearInterval(clockTimer);
        const el = $('hero-time');
        const tick = () => {
            if (!el) return;
            const now = new Date();
            const utc = now.getTime() + now.getTimezoneOffset() * 60000;
            const local = new Date(utc + timezoneOffset * 1000);
            el.textContent = local.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };
        tick(); clockTimer = setInterval(tick, 1000);
    }

    async function fetchAutocomplete(q: string): Promise<void> {
        try {
            const res = await fetch(`${GEO}/direct?q=${encodeURIComponent(q)}&limit=5&appid=${API_KEY}`);
            if (!res.ok) return;
            const list: GeoResult[] = await res.json();
            renderDropdown(list);
        } catch { /* noop */ }
    }

    function renderDropdown(results: GeoResult[]): void {
        dropdown.innerHTML = '';
        if (results.length === 0) { closeDropdown(); return; }
        results.forEach(r => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                </svg>
                <span style="flex:1">${r.name}</span>
                <span>${r.state ? r.state + ', ' : ''}${r.country}</span>
            `;
            item.addEventListener('mousedown', async (e) => {
                e.preventDefault();
                if (cityInput) cityInput.value = r.name;
                closeDropdown();
                localStorage.setItem('lastCity', r.name);
                await loadCity(r.name);
            });
            dropdown.appendChild(item);
        });
        dropdown.classList.add('open');
    }

    function closeDropdown(): void { dropdown.classList.remove('open'); dropdown.innerHTML = ''; }

    async function loadCity(city: string): Promise<void> {
        show(loader); hide(heroCard); hide(errorCard); closeDropdown();
        const [weather, forecastRaw] = await Promise.all([fetchWeather(city), fetchForecastRaw(city)]);
        hide(loader);
        if (!weather || !forecastRaw) {
            const errEl = $('errorMsg');
            if (errEl) errEl.textContent = `Hittade ingen stad med namnet "${city}".`;
            show(errorCard); return;
        }
        const forecast: ForecastData[] = forecastRaw.list.filter((_: any, i: number) => i % 8 === 0).slice(0, 5);
        const hourly: HourlyData[] = forecastRaw.list.slice(0, 8);
        currentWeather = weather; currentForecast = forecast; currentHourly = hourly;
        renderHero(weather, forecast, hourly); startClock(weather.timezone); show(heroCard);
    }

    async function fetchWeather(city: string): Promise<WeatherData | null> {
        try {
            const res = await fetch(`${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=sv`);
            if (!res.ok) return null;
            const d: WeatherResponse = await res.json();
            return {
                name: d.name, country: d.sys?.country ?? '', timezone: d.timezone ?? 0,
                main: { temp: d.main.temp, feels_like: d.main.feels_like, humidity: d.main.humidity, pressure: d.main.pressure },
                weather: [{ description: d.weather?.[0]?.description ?? '', icon: d.weather?.[0]?.icon ?? '', id: d.weather?.[0]?.id ?? 0 }],
                wind: { speed: d.wind?.speed ?? 0 }, visibility: d.visibility ?? 0, uvi: 0,
            };
        } catch { return null; }
    }

    async function fetchForecastRaw(city: string): Promise<ForecastResponse | null> {
        try {
            const res = await fetch(`${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=sv`);
            if (!res.ok) return null; return await res.json();
        } catch { return null; }
    }

    function renderHero(data: WeatherData, forecast: ForecastData[] | null, hourly: HourlyData[] | null): void {
        const temp = convert(data.main.temp), feel = convert(data.main.feels_like);
        const unit = useFahrenheit ? 'F' : 'C';
        const windKmh = Math.round(data.wind.speed * 3.6);
        const vis = (data.visibility / 1000).toFixed(1);
        setText('hero-city',       data.name);
        setText('hero-country',    data.country ? `(${data.country})` : '');
        setText('hero-temp',       String(temp));
        setText('hero-unit',       unit);
        setText('hero-desc',       data.weather[0]?.description ?? '');
        setText('hero-feels',      `${feel}°${unit}`);
        setText('hero-humidity',   `${data.main.humidity}%`);
        setText('hero-wind',       `${windKmh} km/h`);
        setText('hero-visibility', `${vis} km`);
        setText('hero-uv',         data.uvi ? String(data.uvi) : '–');
        setText('hero-pressure',   `${data.main.pressure} hPa`);
        const iconEl = $('hero-icon');
        if (iconEl) iconEl.textContent = owmToEmoji(data.weather[0]?.icon ?? '', data.weather[0]?.id ?? 0);
        if (forecast) renderForecast(forecast);
        if (hourly)   renderHourly(hourly);
    }

    function renderForecast(days: ForecastData[]): void {
        const row = $('forecast-row'); if (!row) return; row.innerHTML = '';
        days.forEach(day => {
            const date = new Date(day.dt_txt);
            const dayName = date.toLocaleDateString('sv-SE', { weekday: 'short' });
            const hi = convert(day.main.temp_max ?? day.main.temp), lo = convert(day.main.temp_min ?? day.main.temp);
            const unit = useFahrenheit ? 'F' : 'C';
            const emoji = owmToEmoji(day.weather?.[0]?.icon ?? '', day.weather?.[0]?.id ?? 0);
            const el = document.createElement('div'); el.className = 'forecast-day';
            el.innerHTML = `
                <span class="forecast-day__name">${dayName}</span>
                <span class="forecast-day__icon">${emoji}</span>
                <span class="forecast-day__hi">${hi}°${unit}</span>
                <span class="forecast-day__lo">${lo}°${unit}</span>`;
            row.appendChild(el);
        });
    }

    function renderHourly(hours: HourlyData[]): void {
        const row = $('hourly-row'); if (!row) return; row.innerHTML = '';
        hours.forEach(h => {
            const date = new Date(h.dt_txt);
            const time = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
            const temp = convert(h.main.temp), unit = useFahrenheit ? 'F' : 'C';
            const emoji = owmToEmoji(h.weather?.[0]?.icon ?? '', h.weather?.[0]?.id ?? 0);
            const rain = h.pop ? `💧 ${Math.round(h.pop * 100)}%` : '';
            const el = document.createElement('div'); el.className = 'hourly-item';
            el.innerHTML = `
                <span class="hourly-item__time">${time}</span>
                <span class="hourly-item__icon">${emoji}</span>
                <span class="hourly-item__temp">${temp}°${unit}</span>
                ${rain ? `<span class="hourly-item__rain">${rain}</span>` : ''}`;
            row.appendChild(el);
        });
    }

    function displayPreset(data: WeatherData, index: number): void {
        const grid = $('preset-weather'); if (!grid) return;
        const temp = convert(data.main.temp), feel = convert(data.main.feels_like);
        const u = useFahrenheit ? 'F' : 'C';
        const emoji = owmToEmoji(data.weather[0]?.icon ?? '', data.weather[0]?.id ?? 0);
        const card = document.createElement('div');
        card.className = 'weather-box'; card.dataset.tempC = String(data.main.temp); card.dataset.feelC = String(data.main.feels_like);
        card.style.animationDelay = `${index * 50}ms`;
        card.innerHTML = `
            <div class="weather-box__top">
                <span class="weather-box__city">${data.name}</span>
                <span class="weather-box__icon">${emoji}</span>
            </div>
            <span class="weather-box__temp">${temp}°${u}</span>
            <span class="weather-box__desc">${data.weather[0]?.description ?? ''}</span>
            <span class="weather-box__sub">Känns som ${feel}°${u}</span>`;
        card.addEventListener('click', async () => {
            if (cityInput) cityInput.value = data.name;
            localStorage.setItem('lastCity', data.name);
            await loadCity(data.name);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        grid.appendChild(card);
    }

    function convert(c: number): number { return useFahrenheit ? Math.round(c * 9 / 5 + 32) : Math.round(c); }
    function setText(id: string, text: string): void { const el = $(id); if (el) el.textContent = text; }
    function show(el: HTMLElement | null): void { if (el) el.style.display = ''; }
    function hide(el: HTMLElement | null): void { if (el) el.style.display = 'none'; }

    function owmToEmoji(icon: string, id: number): string {
        const n = icon.endsWith('n');
        if (id >= 200 && id < 300) return '⛈️';
        if (id >= 300 && id < 400) return '🌦️';
        if (id >= 500 && id < 510) return '🌧️';
        if (id === 511)             return '🌨️';
        if (id >= 520 && id < 600) return '🌦️';
        if (id >= 600 && id < 700) return '❄️';
        if (id >= 700 && id < 800) return '🌫️';
        if (id === 800)             return n ? '🌙' : '☀️';
        if (id === 801)             return '🌤️';
        if (id === 802)             return '⛅';
        if (id >= 803)              return '☁️';
        return '🌡️';
    }
});