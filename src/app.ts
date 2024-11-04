import { WeatherData } from './types';

const apiKey = '757f7c0291760953b1051b6100356250'; 

const weatherInfoDiv = document.getElementById('weather-info') as HTMLDivElement;
const cityInput = document.getElementById('city-input') as HTMLInputElement;
const fetchWeatherButton = document.getElementById('fetch-weather') as HTMLButtonElement;

fetchWeatherButton.addEventListener('click', async () => {
    const city = cityInput.value;
    if (city) {
        localStorage.setItem('lastCity', city);
        const weatherData = await fetchWeather(city);
        displayWeather(weatherData);
    }
});

async function fetchWeather(city: string): Promise<WeatherData> {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    if (!response.ok) {
        throw new Error('Något gick fel när vädret skulle hämtas.');
    }
    const data: WeatherData = await response.json();
    return data;
}

function updateBackground(weatherDescription: string): void {
    document.body.classList.remove("sunny", "cloudy", "rainy", "snowy");

    if (weatherDescription.includes("sun") || weatherDescription.includes("clear sky")) {
        document.body.classList.add("sunny");
    } else if (weatherDescription.includes("cloud")) {
        document.body.classList.add("cloudy");
    } else if (weatherDescription.includes("rain") || weatherDescription.includes("drizzle")) {
        document.body.classList.add("rainy");
    } else if (weatherDescription.includes("snow")) {
        document.body.classList.add("snowy");
    } else {
        document.body.classList.add("cloudy");
    }
}


function displayWeather(data: WeatherData): void {
    const description = data.weather.length > 0 ? data.weather[0].description : "Ingen beskrivning tillgänglig";
    updateBackground(description.toLowerCase());

    weatherInfoDiv.innerHTML = `
        <h2>Väder för ${data.name}</h2>
        <p>Temperatur: ${data.main.temp} °C</p>
        <p>Beskrivning: ${description}</p>
    `;
}

window.onload = () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        fetchWeather(lastCity).then(displayWeather);
    }
};
