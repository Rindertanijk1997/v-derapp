export interface WeatherData {
    main: {
        temp: number;
    };
    weather: Array<{
        description: string;
    }>;
    name: string;
}
export interface ForecastData {
    list: ForecastEntry[]; // Lista över prognosdata
}

export interface ForecastEntry {
    dt: number; // Datum och tid i Unix-tid
    dt_txt: string; // Datum och tid som en sträng
    main: {
        temp: number; // Temperatur för den specifika tidspunkten
    };
}