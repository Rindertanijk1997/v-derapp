const apiKey = '757f7c0291760953b1051b6100356250';
document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const fetchWeatherButton = document.getElementById('fetch-weather');
    const overlay = document.getElementById('overlay');
    const closeOverlayButton = document.getElementById('close-overlay');
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
            const weatherData = await fetchWeather(city);
            if (weatherData) {
                const forecastData = await fetchForecast(city);
                displayOverlay(weatherData, forecastData);
            }
        }
    });
    async function fetchWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error('Error fetching weather data:', response.statusText);
                return null;
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error(`Error: ${error}`);
            return null;
        }
    }
    async function fetchForecast(city) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error('Error fetching forecast data:', response.statusText);
                return null;
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error(`Error: ${error}`);
            return null;
        }
    }
    function displayPresetWeather(data) {
        var _a;
        const weatherDiv = document.createElement('div');
        weatherDiv.className = 'weather-box';
        weatherDiv.innerHTML = `
            <h3>${data.name}</h3>
            <p>Temperatur: ${data.main.temp} °C</p>
            <p>Känns som: ${data.main.feels_like} °C</p>
        `;
        // Lägg till klickhändelse för att visa overlay
        weatherDiv.addEventListener('click', async () => {
            const forecastData = await fetchForecast(data.name);
            displayOverlay(data, forecastData);
        });
        (_a = document.getElementById('preset-weather')) === null || _a === void 0 ? void 0 : _a.appendChild(weatherDiv);
    }
    function displayOverlay(weatherData, forecastData) {
        if (weatherData) {
            // Uppdatera overlay-innehållet
            document.getElementById('overlay-title').textContent = weatherData.name;
            document.getElementById('overlay-temperature').textContent = `Temperatur: ${weatherData.main.temp} °C, Känns som: ${weatherData.main.feels_like} °C`;
            // Lägg till prognosinformation
            const forecastHTML = forecastData.list
                .filter((forecast, index) => index % 8 === 0) // Filtrera för att få varannan (var 8:e, varje 3:e timme)
                .slice(0, 5) // Ta de första fem
                .map((forecast) => {
                const date = new Date(forecast.dt * 1000); // Konvertera Unix-tid till datum
                return `
                        <div>
                            <strong>${date.toLocaleDateString()}</strong>
                            <p>Temperatur: ${forecast.main.temp} °C</p>
                        </div>
                    `;
            }).join('');
            // Lägg till prognos till overlayn
            document.getElementById('overlay-description').innerHTML = forecastHTML;
            overlay.style.display = 'flex'; // Visa overlay
        }
    }
    closeOverlayButton.addEventListener('click', () => {
        overlay.style.display = 'none'; // Dölj overlay
    });
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            overlay.style.display = 'none'; // Dölj overlay om man klickar utanför innehållet
        }
    });
});
export {};
