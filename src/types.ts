export interface WeatherData {
    main: {
        temp: number;
    };
    weather: Array<{
        description: string;
    }>;
    name: string;
}
