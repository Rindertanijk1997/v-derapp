import { WeatherData, ForecastData } from './types';

const apiKey = '757f7c0291760953b1051b6100356250';

// Vänta tills dokumentet är laddat innan vi kör JavaScript-koden
document.addEventListener('DOMContentLoaded', () => {
    // Hämta HTML-elementen som vi kommer att interagera med
    const cityInput = document.getElementById('city-input') as HTMLInputElement;
    const fetchWeatherButton = document.getElementById('fetch-weather') as HTMLButtonElement;
    const overlay = document.getElementById('overlay') as HTMLDivElement;
    const closeOverlayButton = document.getElementById('close-overlay') as HTMLButtonElement;

    const presetCities = ['Stockholm', 'New York', 'Tokyo', 'Kapstaden', 'Sydney'];

    // Hämtar och visa väder för varje förinställd stad
    presetCities.forEach(async (city) => {
        const weatherData = await fetchWeather(city);
        if (weatherData) {
            displayPresetWeather(weatherData); // Visar väder för staden i gränssnittet
        }
    });

    // Hämta väder när användaren klickar på "fetch-weather" knappen
    fetchWeatherButton.addEventListener('click', async () => {
        const city = cityInput.value; // Läs in användarens stad
        if (city) {
            // Hämta väderdata för den staden
            const weatherData = await fetchWeather(city);
            if (weatherData) {
                // Hämta en väderprognos för staden om vädret är tillgängligt
                const forecastData = await fetchForecast(city);
                // Visa väder och prognos i ett overlay-fönster
                displayOverlay(weatherData, forecastData);
            }
        }
    });

    // Hämtar väderdata från OpenWeatherMap API
    async function fetchWeather(city: string): Promise<WeatherData | null> {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error('Error fetching weather data:', response.statusText);
                return null;
            }
            return await response.json() as WeatherData;
        } catch (error) {
            console.error(`Error: ${error}`);
            return null; // Om ett fel inträffar, returnera null
        }
    }

    // Hämtar väderprognos från OpenWeatherMap API (5-dagars prognos)
    async function fetchForecast(city: string): Promise<ForecastData[] | null> {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error('Error fetching forecast data:', response.statusText);
                return null;
            }
            const data = await response.json();
            return data.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 5) as ForecastData[];
        } catch (error) {
            console.error(`Error: ${error}`);
            return null; // Om ett fel inträffar, returnera null
        }
    }

    // Visar väderinformation för förinställda städer
    function displayPresetWeather(data: WeatherData): void {
        const weatherDiv = document.createElement('div');
        weatherDiv.className = 'weather-box';
        weatherDiv.innerHTML = `
            <h3>${data.name}</h3>
            <p>Temperatur: ${data.main.temp} °C</p>
            <p>Känns som: ${data.main.feels_like} °C</p>
        `;

        // Lägg till en klickhändelse för att visa mer information om staden när man klickar på väderboxen
        weatherDiv.addEventListener('click', async () => {
            const forecastData = await fetchForecast(data.name);
            displayOverlay(data, forecastData);
        });

        document.getElementById('preset-weather')?.appendChild(weatherDiv);
    }

    // Visa väderinformation och prognos i ett overlay
    function displayOverlay(data: WeatherData, forecast: ForecastData[] | null): void {
        document.getElementById('overlay-title')!.textContent = data.name;
        document.getElementById('overlay-temperature')!.textContent = `Temperatur: ${data.main.temp} °C, Känns som: ${data.main.feels_like} °C`;

        // Om prognosdata finns, skapa och visa prognosen
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

    // Stäng overlay när man klickar på stäng-knappen
    closeOverlayButton.addEventListener('click', () => {
        overlay.style.display = 'none'; // Döljer overlay
        document.getElementById('overlay-content')!.innerHTML = ''; // Rensa prognosen när overlay stängs
    });
});
