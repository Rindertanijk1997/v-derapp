const apiKey = '757f7c0291760953b1051b6100356250';
document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const fetchWeatherButton = document.getElementById('fetch-weather');
    const overlay = document.getElementById('overlay');
    const closeOverlayButton = document.getElementById('close-overlay');
    const presetCities = ['Stockholm', 'New York', 'Tokyo', 'Cairo', 'Sydney'];
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
                displayOverlay(weatherData);
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
    function displayPresetWeather(data) {
        var _a;
        const weatherDiv = document.createElement('div');
        weatherDiv.className = 'weather-box';
        weatherDiv.innerHTML = `
            <h3>${data.name}</h3>
            <p>Temperatur: ${data.main.temp} °C</p>
            <p>Känns som: ${data.main.feels_like} °C</p>
        `;
        (_a = document.getElementById('preset-weather')) === null || _a === void 0 ? void 0 : _a.appendChild(weatherDiv);
    }
    function displayOverlay(data) {
        if (data) {
            // Uppdatera overlay-innehållet
            document.getElementById('overlay-title').textContent = data.name;
            document.getElementById('overlay-temperature').textContent = `Temperatur: ${data.main.temp} °C, Känns som: ${data.main.feels_like} °C`;
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
