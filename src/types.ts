// ── Nuvarande väder (returnerat från appen) ──────────────────────────────────
export interface WeatherData {
    name:       string;
    country:    string;
    timezone:   number;     // sekunder från UTC
    main: {
        temp:       number;
        feels_like: number;
        humidity:   number;
        pressure:   number;
    };
    weather: {
        description: string;
        icon:        string;
        id:          number;
    }[];
    wind:       { speed: number };
    visibility: number;
    uvi:        number;
}

// ── OWM /weather API-svar ────────────────────────────────────────────────────
export interface WeatherResponse {
    name:     string;
    timezone: number;
    sys:      { country: string };
    main: {
        temp:       number;
        feels_like: number;
        humidity:   number;
        pressure:   number;
    };
    weather:  { description: string; icon: string; id: number }[];
    wind:     { speed: number };
    visibility: number;
}

// ── OWM /forecast dagsvärde ──────────────────────────────────────────────────
export interface ForecastData {
    dt_txt: string;
    main: {
        temp:       number;
        feels_like: number;
        temp_min?:  number;
        temp_max?:  number;
    };
    weather?: { description: string; icon: string; id: number }[];
    pop?:     number;   // sannolikhet för nederbörd 0–1
}

// ── Timprognos (samma struktur som ForecastData) ─────────────────────────────
export type HourlyData = ForecastData;

// ── OWM /forecast API-svar ───────────────────────────────────────────────────
export interface ForecastResponse {
    list: ForecastData[];
}