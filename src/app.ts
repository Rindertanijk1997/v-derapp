import { WeatherData, ForecastData, ForecastResponse, WeatherResponse } from './types';

const apiKey = '757f7c0291760953b1051b6100356250';

document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input') as HTMLInputElement;
    const fetchWeatherButton = document.getElementById('fetch-weather') as HTMLButtonElement;
    const overlay = document.getElementById('overlay') as HTMLDivElement;
    const closeOverlayButton = document.getElementById('close-overlay') as HTMLButtonElement;

    const lastSearchedCity = localStorage.getItem('lastSearchedCity');
    if (lastSearchedCity) {
        cityInput.value = lastSearchedCity;
        fetchWeatherForCity(lastSearchedCity);
    }

    const presetCities = ['Stockholm', 'New York', 'Tokyo', 'Kapstaden', 'Sydney'];
    presetCities.forEach(async (city) => {
        const weatherData = await fetchWeather(city);
        if (weatherData) {
            displayPresetWeather(weatherData);
        }
    });

    fetchWeatherButton.addEventListener('click', async () => {
        const city = cityInput.value;
        if (city) {
            localStorage.setItem('lastSearchedCity', city);
            fetchWeatherForCity(city);
        }
    });

    async function fetchWeatherForCity(city: string) {
        const weatherData = await fetchWeather(city);
        if (weatherData) {
            const forecastData = await fetchForecast(city);
            displayOverlay(weatherData, forecastData);
        }
    }

    async function fetchWeather(city: string): Promise<WeatherData | null> {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(url);
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
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error('Error fetching forecast data:', response.statusText);
                return null;
            }
            const data: ForecastResponse = await response.json();
            return data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
        } catch (error) {
            console.error(`Error: ${error}`);
            return null;
        }
    }

    function displayPresetWeather(data: WeatherData): void {
        const weatherDiv = document.createElement('div');
        weatherDiv.className = 'weather-box';
        weatherDiv.innerHTML = `
            <h3>${data.name}</h3>
            <p>Temperatur: ${data.main.temp} °C</p>
            <p>Känns som: ${data.main.feels_like} °C</p>
        `;

        weatherDiv.addEventListener('click', async () => {
            const forecastData = await fetchForecast(data.name);
            displayOverlay(data, forecastData);
        });

        document.getElementById('preset-weather')?.appendChild(weatherDiv);
    }

    function displayOverlay(data: WeatherData, forecast: ForecastData[] | null): void {
        document.getElementById('overlay-title')!.textContent = data.name;
        document.getElementById('overlay-temperature')!.textContent = `Temperatur: ${data.main.temp} °C, Känns som: ${data.main.feels_like} °C`;

        if (forecast) {
            const forecastDiv = document.createElement('div');
            forecast.forEach((day) => {
                const dayDiv = document.createElement('p');
                dayDiv.textContent = `${day.main.temp} °C (Känns som ${day.main.feels_like} °C)`;
                forecastDiv.appendChild(dayDiv);
            });
            document.getElementById('overlay-content')!.appendChild(forecastDiv);
        }

        overlay.style.display = 'flex';
    }

    closeOverlayButton.addEventListener('click', () => {
        overlay.style.display = 'none';
        document.getElementById('overlay-content')!.innerHTML = '';
    });
});
