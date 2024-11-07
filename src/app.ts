import { WeatherData, ForecastData, ForecastResponse, WeatherResponse } from './types';

const apiKey = '757f7c0291760953b1051b6100356250';

document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input') as HTMLInputElement | null;
    const fetchWeatherButton = document.getElementById('fetch-weather') as HTMLButtonElement | null;
    const overlay = document.getElementById('overlay') as HTMLDivElement | null;
    const closeOverlayButton = document.getElementById('close-overlay') as HTMLButtonElement | null;

    const lastSearchedCity: string | null = localStorage.getItem('lastSearchedCity');
    if (lastSearchedCity) {
        cityInput!.value = lastSearchedCity;
        fetchWeatherForCity(lastSearchedCity);
    }

    const presetCities: string[] = ['Stockholm', 'New York', 'Tokyo', 'Kapstaden', 'Sydney'];
    presetCities.forEach(async (city: string) => {
        const weatherData: WeatherData | null = await fetchWeather(city);
        if (weatherData) {
            displayPresetWeather(weatherData);
        }
    });

    fetchWeatherButton?.addEventListener('click', async () => {
        const city: string = cityInput!.value;
        if (city) {
            localStorage.setItem('lastSearchedCity', city);
            fetchWeatherForCity(city);
        }
    });

    async function fetchWeatherForCity(city: string): Promise<void> {
        const weatherData: WeatherData | null = await fetchWeather(city);
        if (weatherData) {
            const forecastData: ForecastData[] | null = await fetchForecast(city);
            if (forecastData) {
                displayOverlay(weatherData, forecastData);
            }
        }
    }

    async function fetchWeather(city: string): Promise<WeatherData | null> {
        const url: string = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const response: Response = await fetch(url);
            if (!response.ok) {
                console.error('Error fetching weather data:', response.statusText);
                return null;
            }
            const data: WeatherResponse = await response.json();
            return {
                name: data.name,
                main: {
                    temp: data.main.temp,
                    feels_like: data.main.feels_like,
                },
            };
        } catch (error) {
            console.error(`Error: ${error}`);
            return null;
        }
    }

    async function fetchForecast(city: string): Promise<ForecastData[] | null> {
        const url: string = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    
        try {
            const response: Response = await fetch(url);
            if (!response.ok) {
                console.error('Error fetching forecast data:', response.statusText);
                return null;
            }
            const data: ForecastResponse = await response.json();
            return data.list.filter((_, index: number) => index % 8 === 0).slice(0, 5); 
        } catch (error) {
            console.error(`Error: ${error}`);
            return null;
        }
    }
    

    function displayPresetWeather(data: WeatherData): void {
        const weatherDiv: HTMLDivElement = document.createElement('div');
        weatherDiv.className = 'weather-box';
        weatherDiv.innerHTML = `
            <h3>${data.name}</h3>
            <p>Temperatur: ${data.main.temp} °C</p>
            <p>Känns som: ${data.main.feels_like} °C</p>
        `;

        weatherDiv.addEventListener('click', async () => {
            const forecastData: ForecastData[] | null = await fetchForecast(data.name);
            if (forecastData) {
                displayOverlay(data, forecastData);
            }
        });

        document.getElementById('preset-weather')?.appendChild(weatherDiv);
    }

    function displayOverlay(data: WeatherData, forecast: ForecastData[] | null): void {
        document.getElementById('overlay-title')!.textContent = data.name;
        document.getElementById('overlay-temperature')!.textContent = `Temperatur: ${data.main.temp} °C, Känns som: ${data.main.feels_like} °C`;

        if (forecast) {
            const forecastDiv: HTMLDivElement = document.createElement('div');
            forecast.forEach((day: ForecastData) => {
                const dayDiv: HTMLParagraphElement = document.createElement('p');
                dayDiv.textContent = `${day.main.temp} °C (Känns som ${day.main.feels_like} °C)`;
                forecastDiv.appendChild(dayDiv);
            });
            document.getElementById('overlay-content')!.appendChild(forecastDiv);
        }

        overlay!.style.display = 'flex';
    }

    closeOverlayButton?.addEventListener('click', () => {
        overlay!.style.display = 'none';
        document.getElementById('overlay-content')!.innerHTML = '';
    });
});
