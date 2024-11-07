// Typ för väderdata som hämtas från OpenWeatherMap API
export interface WeatherData {
    name: string;
    main: {
        temp: number;
        feels_like: number;
    };
}

// Typ för varje väderprognos (en del av den 5-dagarsprognos som hämtas från API)
export interface ForecastData {
    main: {
        temp: number;
        feels_like: number;
    };
    dt_txt: string;  // Tidsstämpel för varje väderprognos
}

// Typ för själva API-svaret när man hämtar prognosen (inklusive listan med prognoser)
export interface ForecastResponse {
    list: ForecastData[];
}

// Typ för det globala väderresponset (nuvarande väder)
export interface WeatherResponse {
    main: {
        temp: number;
        feels_like: number;
    };
    name: string;
}
