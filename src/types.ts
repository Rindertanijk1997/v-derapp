export interface WeatherData {
    main: {
        temp: number;
        feels_like: number;
    };
    name: string;
    weather: {
        description: string;
        icon: string;
    }[];
}

export interface ForecastData {
    dt_txt: string; // Datum och tid för prognosen
    main: {
        temp: number;
        feels_like: number;
    };
    weather: {
        description: string;
    }[];
}
