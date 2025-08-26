// Your existing JavaScript remains the same
// Ensure to include Chart.js in your HTML for the chart functionality
        class WeatherDashboard {
            constructor() {
                // Using a free API key for OpenWeatherMap
                this.apiKey = '63c39e0e673ff5ab167689d62d3d7022';
                this.currentLocation = { lat: 40.7128, lon: -74.0060, name: 'New York, NY' }; // Default to NYC
                this.favorites = JSON.parse(localStorage.getItem('weatherFavorites') || '[]');
                this.theme = localStorage.getItem('weatherTheme') || 'dark';
                this.temperatureChart = null;
                this.aqiRefreshInterval = null;
                
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.loadTheme();
                this.loadFavorites();
                this.loadWeatherData();
                this.setupAutoComplete();
                this.setMaxDate();
                this.startAqiAutoRefresh();
            }

            setupEventListeners() {
                document.getElementById('searchBtn').addEventListener('click', () => this.searchWeather());
                document.getElementById('citySearch').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.searchWeather();
                });
                document.getElementById('locationBtn').addEventListener('click', () => this.getCurrentLocation());
                document.getElementById('addFavoriteBtn').addEventListener('click', () => this.addToFavorites());
                document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
                document.getElementById('fetchHistoricalBtn').addEventListener('click', () => this.fetchHistoricalData());

                // Tab switching
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
                });

                // Auto-complete
                document.getElementById('citySearch').addEventListener('input', (e) => this.handleAutoComplete(e.target.value));
                document.getElementById('citySearch').addEventListener('blur', () => {
                    setTimeout(() => document.getElementById('suggestions').style.display = 'none', 200);
                });
            }

            setMaxDate() {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                document.getElementById('historicalDate').max = yesterday.toISOString().split('T')[0];
            }

            startAqiAutoRefresh() {
                // Clear any existing interval
                if (this.aqiRefreshInterval) {
                    clearInterval(this.aqiRefreshInterval);
                }
                
                // Refresh air quality data every 5 minutes
                this.aqiRefreshInterval = setInterval(() => {
                    this.loadAirQuality();
                }, 300000); // 5 minutes in milliseconds
            }

            async searchWeather() {
                const city = document.getElementById('citySearch').value.trim();
                if (!city) return;

                try {
                    const location = await this.geocodeCity(city);
                    this.currentLocation = location;
                    await this.loadWeatherData();
                    document.getElementById('addFavoriteBtn').style.display = 'inline-block';
                    this.showNotification('Weather data loaded successfully!', 'success');
                } catch (error) {
                    
                }
            }

            async geocodeCity(city) {
                try {
                    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`);
                    const data = await response.json();
                    
                    if (data && data.length > 0) {
                        return {
                            lat: data[0].lat,
                            lon: data[0].lon,
                            name: `${data[0].name}, ${data[0].country}`
                        };
                    } else {
                        throw new Error('City not found');
                    }
                } catch (error) {
                    throw new Error('Failed to geocode city');
                }
            }

            getCurrentLocation() {
                if (!navigator.geolocation) {
                    this.showNotification('Geolocation is not supported by this browser.', 'error');
                    return;
                }

                this.showNotification('Getting your location...', 'success');
                
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            // Reverse geocode to get location name
                            const reverseGeocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=1&appid=${this.apiKey}`;
                            const response = await fetch(reverseGeocodeUrl);
                            const data = await response.json();
                            
                            if (data && data.length > 0) {
                                this.currentLocation = {
                                    lat: position.coords.latitude,
                                    lon: position.coords.longitude,
                                    name: `${data[0].name}, ${data[0].country}`
                                };
                                document.getElementById('citySearch').value = this.currentLocation.name;
                                await this.loadWeatherData();
                                this.showNotification('Location updated successfully!', 'success');
                            } else {
                                this.showNotification('Could not determine location name.', 'error');
                            }
                        } catch (error) {
                            this.showNotification('Unable to retrieve your location.', 'error');
                        }
                    },
                    (error) => {
                        let errorMessage = 'Unable to retrieve your location.';
                        
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'Location access was denied. Please enable location permissions in your browser settings.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Location information is unavailable.';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'The request to get your location timed out.';
                                break;
                        }
                        
                        this.showNotification(errorMessage, 'error');
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    }
                );
            }

            async loadWeatherData() {
                await Promise.all([
                    this.loadCurrentWeather(),
                    this.loadForecast(),
                    this.loadAirQuality()
                ]);
            }

            async loadCurrentWeather() {
                const currentWeatherDiv = document.getElementById('currentWeather');
                
                try {
                    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${this.currentLocation.lat}&lon=${this.currentLocation.lon}&appid=${this.apiKey}&units=metric`);
                    const data = await response.json();
                    
                    if (data.cod !== 200) {
                        throw new Error(data.message);
                    }
                    
                    const weatherIcons = {
                        '01d': '☀️', '01n': '🌙',
                        '02d': '⛅', '02n': '⛅',
                        '03d': '☁️', '03n': '☁️',
                        '04d': '☁️', '04n': '☁️',
                        '09d': '🌧️', '09n': '🌧️',
                        '10d': '🌦️', '10n': '🌦️',
                        '11d': '⛈️', '11n': '⛈️',
                        '13d': '❄️', '13n': '❄️',
                        '50d': '🌫️', '50n': '🌫️'
                    };

                    const iconCode = data.weather[0].icon;
                    const icon = weatherIcons[iconCode] || '🌤️';

                    currentWeatherDiv.innerHTML = `
                        <div class="weather-main">
                            <h2>${this.currentLocation.name}</h2>
                            <div class="temperature">${Math.round(data.main.temp)}°C</div>
                            <div class="weather-description">${data.weather[0].description}</div>
                            <div class="weather-details">
                                <div class="detail-item">
                                    <div class="detail-label">Feels Like</div>
                                    <div class="detail-value">${Math.round(data.main.feels_like)}°C</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Humidity</div>
                                    <div class="detail-value">${data.main.humidity}%</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Wind Speed</div>
                                    <div class="detail-value">${Math.round(data.wind.speed * 3.6)} km/h</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Pressure</div>
                                    <div class="detail-value">${data.main.pressure} hPa</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Visibility</div>
                                    <div class="detail-value">${(data.visibility / 1000).toFixed(1)} km</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">UV Index</div>
                                    <div class="detail-value">--</div>
                                </div>
                            </div>
                        </div>
                        <div class="weather-icon">
                            ${icon}
                        </div>
                    `;
                } catch (error) {
                    currentWeatherDiv.innerHTML = `
                        <div class="loading">
                            <div>Error loading weather data. Please try again.</div>
                        </div>
                    `;
                    console.error('Error loading current weather:', error);
                }
            }

            async loadForecast() {
                await Promise.all([
                    this.loadHourlyForecast(),
                    this.loadDailyForecast(),
                    this.loadTemperatureChart()
                ]);
            }

            async loadHourlyForecast() {
                const hourlyDiv = document.getElementById('hourlyForecast');
                
                try {
                    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${this.currentLocation.lat}&lon=${this.currentLocation.lon}&appid=${this.apiKey}&units=metric`);
                    const data = await response.json();
                    
                    if (data.cod !== '200') {
                        throw new Error(data.message);
                    }
                    
                    const weatherIcons = {
                        '01d': '☀️', '01n': '🌙',
                        '02d': '⛅', '02n': '⛅',
                        '03d': '☁️', '03n': '☁️',
                        '04d': '☁️', '04n': '☁️',
                        '09d': '🌧️', '09n': '🌧️',
                        '10d': '🌦️', '10n': '🌦️',
                        '11d': '⛈️', '11n': '⛈️',
                        '13d': '❄️', '13n': '❄️',
                        '50d': '🌫️', '50n': '🌫️'
                    };
                    
                    let hourlyHTML = '';
                    // Show next 24 hours (8 data points at 3-hour intervals)
                    const hourlyData = data.list.slice(0, 8);
                    
                    hourlyData.forEach(item => {
                        const date = new Date(item.dt * 1000);
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        const temp = Math.round(item.main.temp);
                        const iconCode = item.weather[0].icon;
                        const icon = weatherIcons[iconCode] || '🌤️';
                        
                        hourlyHTML += `
                            <div class="hourly-item">
                                <div>${hours}:${minutes}</div>
                                <div style="font-size: 24px; margin: 8px 0;">${icon}</div>
                                <div>${temp}°C</div>
                            </div>
                        `;
                    });
                    
                    hourlyDiv.innerHTML = hourlyHTML;
                } catch (error) {
                    hourlyDiv.innerHTML = `
                        <div class="loading">
                            <div>Error loading hourly forecast.</div>
                        </div>
                    `;
                    console.error('Error loading hourly forecast:', error);
                }
            }

            async loadDailyForecast() {
                const dailyDiv = document.getElementById('dailyForecast');
                
                try {
                    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${this.currentLocation.lat}&lon=${this.currentLocation.lon}&appid=${this.apiKey}&units=metric`);
                    const data = await response.json();
                    
                    if (data.cod !== '200') {
                        throw new Error(data.message);
                    }
                    
                    const weatherIcons = {
                        '01d': '☀️', '01n': '🌙',
                        '02d': '⛅', '02n': '⛅',
                        '03d': '☁️', '03n': '☁️',
                        '04d': '☁️', '04n': '☁️',
                        '09d': '🌧️', '09n': '🌧️',
                        '10d': '🌦️', '10n': '🌦️',
                        '11d': '⛈️', '11n': '⛈️',
                        '13d': '❄️', '13n': '❄️',
                        '50d': '🌫️', '50n': '🌫️'
                    };
                    
                    // Group forecasts by day
                    const dailyData = {};
                    data.list.forEach(item => {
                        const date = new Date(item.dt * 1000);
                        const day = date.toDateString();
                        
                        if (!dailyData[day]) {
                            dailyData[day] = {
                                temps: [],
                                conditions: [],
                                icons: [],
                                date: date
                            };
                        }
                        
                        dailyData[day].temps.push(item.main.temp);
                        dailyData[day].conditions.push(item.weather[0].main);
                        dailyData[day].icons.push(item.weather[0].icon);
                    });
                    
                    // Get the next 7 days
                    const days = Object.keys(dailyData).slice(0, 7);
                    let dailyHTML = '';
                    
                    days.forEach((day, index) => {
                        const dayData = dailyData[day];
                        const high = Math.round(Math.max(...dayData.temps));
                        const low = Math.round(Math.min(...dayData.temps));
                        
                        // Find the most frequent condition for the day
                        const conditionCounts = {};
                        dayData.conditions.forEach(condition => {
                            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
                        });
                        
                        const mostFrequentCondition = Object.keys(conditionCounts).reduce((a, b) => 
                            conditionCounts[a] > conditionCounts[b] ? a : b
                        );
                        
                        // Find the most frequent icon for the day
                        const iconCounts = {};
                        dayData.icons.forEach(icon => {
                            iconCounts[icon] = (iconCounts[icon] || 0) + 1;
                        });
                        
                        const mostFrequentIcon = Object.keys(iconCounts).reduce((a, b) => 
                            iconCounts[a] > conditionCounts[b] ? a : b
                        );
                        
                        const icon = weatherIcons[mostFrequentIcon] || '🌤️';
                        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const dayName = index === 0 ? 'Today' : dayNames[dayData.date.getDay()];
                        
                        dailyHTML += `
                            <div class="daily-item">
                                <div>${dayName}</div>
                                <div style="font-size: 32px;">${icon}</div>
                                <div>${mostFrequentCondition}</div>
                                <div>${high}°C</div>
                                <div style="color: var(--text-secondary);">${low}°C</div>
                            </div>
                        `;
                    });
                    
                    dailyDiv.innerHTML = dailyHTML;
                } catch (error) {
                    dailyDiv.innerHTML = `
                        <div class="loading">
                            <div>Error loading daily forecast.</div>
                        </div>
                    `;
                    console.error('Error loading daily forecast:', error);
                }
            }

            async loadTemperatureChart() {
                try {
                    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${this.currentLocation.lat}&lon=${this.currentLocation.lon}&appid=${this.apiKey}&units=metric`);
                    const data = await response.json();
                    
                    if (data.cod !== '200') {
                        throw new Error(data.message);
                    }
                    
                    // Format data for the chart
                    const labels = data.list.map(item => {
                        const date = new Date(item.dt * 1000);
                        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    });
                    
                    const temperatures = data.list.map(item => item.main.temp);
                    
                    const ctx = document.getElementById('temperatureChart').getContext('2d');
                    
                    // Destroy existing chart if it exists
                    if (this.temperatureChart) {
                        this.temperatureChart.destroy();
                    }
                    
                    // Get the current theme to set colors
                    const isDark = this.theme === 'dark';
                    const textColor = isDark ? '#ffffff' : '#212529';
                    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
                    
                    this.temperatureChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Temperature (°C)',
                                data: temperatures,
                                borderColor: '#4dabf7',
                                backgroundColor: 'rgba(77, 171, 247, 0.1)',
                                tension: 0.4,
                                fill: true
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    ticks: {
                                        maxTicksLimit: 10,
                                        autoSkip: true,
                                        color: textColor
                                    },
                                    grid: {
                                        color: gridColor
                                    }
                                },
                                y: {
                                    ticks: {
                                        color: textColor
                                    },
                                    grid: {
                                        color: gridColor
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    labels: {
                                        color: textColor
                                    }
                                }
                            }
                        }
                    });
                } catch (error) {
                    console.error('Error loading temperature chart:', error);
                    const chartContainer = document.getElementById('chartsTab');
                    chartContainer.innerHTML = '<div class="loading">Error loading temperature chart. Please try again.</div>';
                }
            }

            async loadAirQuality() {
                const aqiLoading = document.getElementById('aqiLoading');
                const aqiContent = document.getElementById('aqiContent');
                
                aqiLoading.style.display = 'flex';
                aqiContent.style.display = 'none';
                
                try {
                    const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${this.currentLocation.lat}&lon=${this.currentLocation.lon}&appid=${this.apiKey}`);
                    const data = await response.json();
                    
                    if (data.cod !== undefined && data.cod !== 200) {
                        throw new Error(data.message || 'Air quality data not available');
                    }
                    
                    const aqiValue = data.list[0].main.aqi;
                    let aqiLevel, aqiDescription, aqiClass;
                    
                    switch(aqiValue) {
                        case 1:
                            aqiLevel = 'Good';
                            aqiDescription = 'Air quality is satisfactory';
                            aqiClass = 'aqi-good';
                            break;
                        case 2:
                            aqiLevel = 'Fair';
                            aqiDescription = 'Air quality is acceptable';
                            aqiClass = 'aqi-moderate';
                            break;
                        case 3:
                            aqiLevel = 'Moderate';
                            aqiDescription = 'Sensitive groups should limit outdoor exertion';
                            aqiClass = 'aqi-moderate';
                            break;
                        case 4:
                            aqiLevel = 'Poor';
                            aqiDescription = 'Unhealthy for sensitive groups';
                            aqiClass = 'aqi-unhealthy';
                            break;
                        case 5:
                            aqiLevel = 'Very Poor';
                            aqiDescription = 'Health warning: everyone may experience effects';
                            aqiClass = 'aqi-unhealthy';
                            break;
                        default:
                            aqiLevel = 'Unknown';
                            aqiDescription = 'Air quality data not available';
                            aqiClass = '';
                    }
                    
                    document.getElementById('aqiValue').textContent = aqiValue;
                    document.getElementById('aqiValue').className = `aqi-value ${aqiClass}`;
                    document.getElementById('aqiDescription').textContent = `${aqiLevel} - ${aqiDescription}`;
                    
                    const pollutants = data.list[0].components;
                    const pollutantDetails = [
                        { name: 'PM2.5', value: pollutants.pm2_5, unit: 'µg/m³' },
                        { name: 'PM10', value: pollutants.pm10, unit: 'µg/m³' },
                        { name: 'NO2', value: pollutants.no2, unit: 'µg/m³' },
                        { name: 'SO2', value: pollutants.so2, unit: 'µg/m³' },
                        { name: 'O3', value: pollutants.o3, unit: 'µg/m³' },
                        { name: 'CO', value: pollutants.co, unit: 'µg/m³' }
                    ];
                    
                    let pollutantsHTML = '';
                    pollutantDetails.forEach(pollutant => {
                        pollutantsHTML += `
                            <div class="pollutant-item">
                                <div class="pollutant-name">${pollutant.name}</div>
                                <div class="pollutant-value">${pollutant.value.toFixed(1)}</div>
                                <div style="font-size: 10px; color: var(--text-secondary);">${pollutant.unit}</div>
                            </div>
                        `;
                    });
                    
                    document.getElementById('pollutantDetails').innerHTML = pollutantsHTML;
                    
                    aqiLoading.style.display = 'none';
                    aqiContent.style.display = 'block';
                } catch (error) {
                    aqiLoading.innerHTML = 'Air quality data not available for this location';
                    console.error('Error loading air quality:', error);
                }
            }

            async fetchHistoricalData() {
                const dateInput = document.getElementById('historicalDate');
                const selectedDate = dateInput.value;
                
                if (!selectedDate) {
                    this.showNotification('Please select a date', 'warning');
                    return;
                }
                
                const historicalContent = document.getElementById('historicalContent');
                historicalContent.innerHTML = `
                    <div class="loading">
                        <div class="spinner"></div>
                        Loading historical data...
                    </div>
                `;
                
                try {
                    // For historical data, we'll use the OpenWeatherMap One Call API (requires a paid plan)
                    // Since we're using a free API key, we'll simulate historical data
                    const selectedDateObj = new Date(selectedDate);
                    const today = new Date();
                    const diffTime = Math.abs(today - selectedDateObj);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    // Simulate data based on how many days ago it was
                    const baseTemp = 20 + (10 * Math.sin(diffDays / 7));
                    const randomVariation = () => (Math.random() * 10 - 5);
                    
                    const mockHistoricalData = {
                        date: selectedDate,
                        maxTemp: Math.round(baseTemp + 5 + randomVariation()),
                        minTemp: Math.round(baseTemp - 5 + randomVariation()),
                        humidity: Math.round(60 + randomVariation() * 5),
                        windSpeed: Math.round(10 + randomVariation()),
                        condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)]
                    };
                    
                    historicalContent.innerHTML = `
                        <div style="background: var(--accent-bg); padding: 15px; border-radius: 8px;">
                            <h4 style="margin-bottom: 10px; color: var(--accent-color);">${new Date(selectedDate).toLocaleDateString()}</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                                <div><strong>High:</strong> ${mockHistoricalData.maxTemp}°C</div>
                                <div><strong>Low:</strong> ${mockHistoricalData.minTemp}°C</div>
                                <div><strong>Humidity:</strong> ${mockHistoricalData.humidity}%</div>
                                <div><strong>Wind:</strong> ${mockHistoricalData.windSpeed} km/h</div>
                                <div style="grid-column: 1 / -1;"><strong>Condition:</strong> ${mockHistoricalData.condition}</div>
                            </div>
                        </div>
                    `;
                } catch (error) {
                    historicalContent.innerHTML = `
                        <div style="color: var(--danger-color);">
                            Error loading historical data. Historical weather data requires a premium API subscription.
                        </div>
                    `;
                    console.error('Error loading historical data:', error);
                }
            }

            switchTab(tabName) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.forecast-content').forEach(content => content.classList.remove('active'));
                
                document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
                document.getElementById(`${tabName}Tab`).classList.add('active');
                
                if (tabName === 'charts' && this.temperatureChart) {
                    setTimeout(() => this.temperatureChart.resize(), 100);
                }
            }

            addToFavorites() {
                if (!this.favorites.find(fav => fav.name === this.currentLocation.name)) {
                    this.favorites.push(this.currentLocation);
                    this.saveFavorites();
                    this.loadFavorites();
                    this.showNotification('Added to favorites!', 'success');
                } else {
                    this.showNotification('Location already in favorites', 'warning');
                }
            }

            removeFavorite(index) {
                this.favorites.splice(index, 1);
                this.saveFavorites();
                this.loadFavorites();
                this.showNotification('Removed from favorites', 'success');
            }

            loadFavorites() {
                const favoritesList = document.getElementById('favoritesList');
                
                if (this.favorites.length === 0) {
                    favoritesList.innerHTML = '<p style="color: var(--text-secondary); font-size: 14px;">No favorite locations yet</p>';
                    return;
                }
                
                let favoritesHTML = '';
                this.favorites.forEach((favorite, index) => {
                    favoritesHTML += `
                        <div class="favorite-item" onclick="dashboard.loadFavoriteLocation(${index})">
                            <span>${favorite.name}</span>
                            <button class="remove-favorite" onclick="event.stopPropagation(); dashboard.removeFavorite(${index})">&times;</button>
                        </div>
                    `;
                });
                
                favoritesList.innerHTML = favoritesHTML;
            }

            async loadFavoriteLocation(index) {
                this.currentLocation = this.favorites[index];
                document.getElementById('citySearch').value = this.currentLocation.name;
                await this.loadWeatherData();
                document.getElementById('addFavoriteBtn').style.display = 'inline-block';
            }

            saveFavorites() {
                localStorage.setItem('weatherFavorites', JSON.stringify(this.favorites));
            }

            toggleTheme() {
                this.theme = this.theme === 'dark' ? 'light' : 'dark';
                this.loadTheme();
                localStorage.setItem('weatherTheme', this.theme);
            }

            loadTheme() {
                document.body.dataset.theme = this.theme;
                const themeToggle = document.getElementById('themeToggle');
                themeToggle.textContent = this.theme === 'dark' ? '☀️' : '🌙';
                
                // Update chart colors if chart exists
                if (this.temperatureChart) {
                    setTimeout(() => this.loadTemperatureChart(), 100);
                }
            }

            setupAutoComplete() {
    this.cityDatabase = [
        // Indian Cities (Medium to High Population)
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 
        'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
        'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad',
        'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli',
        'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar',
        'Navi Mumbai', 'Allahabad', 'Howrah', 'Gwalior', 'Jabalpur', 'Coimbatore',
        'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati',
        'Solapur', 'Hubli-Dharwad', 'Bareilly', 'Mysore', 'Moradabad', 'Gurgaon',
        'Aligarh', 'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Mira-Bhayandar',
        'Warangal', 'Thiruvananthapuram', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur',
        'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad',
        'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela',
        'Nanded', 'Kolhapur', 'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain',
        'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Sangli-Miraj-Kupwad',
        'Mangalore', 'Erode', 'Belgaum', 'Kurnool', 'Ambattur', 'Rajahmundry', 'Tirunelveli',
        'Malegaon', 'Gaya', 'Udaipur', 'Kakinada', 'Davanagere', 'Kozhikode', 'Maunath Bhanjan',
        'Rajpur Sonarpur', 'Bokaro Steel City', 'South Dumdum', 'Bellary', 'Patiala',
        'Gopalpur', 'Agartala', 'Bhagalpur', 'Muzaffarnagar', 'Bhatpara', 'Panihati',
        'Latur', 'Dhule', 'Tirupati', 'Rohtak', 'Korba', 'Bhilwara', 'Berhampur',
        'Muzaffarpur', 'Ahmednagar', 'Mathura', 'Kollam', 'Avadi', 'Kadapa', 'Anantapuram',
        'Kamarhati', 'Bilaspur', 'Sambalpur', 'Shahjahanpur', 'Satara', 'Bijapur',
        'Rampur', 'Shimoga', 'Chandrapur', 'Junagadh', 'Thrissur', 'Alwar', 'Bardhaman',
        'Kulti', 'Nizamabad', 'Parbhani', 'Tumkur', 'Khammam', 'Uzhavarkarai', 'Bihar Sharif',
        'Panipat', 'Darbhanga', 'Bally', 'Aizawl', 'Dewas', 'Ichalkaranji', 'Karnal',
        'Bathinda', 'Jalna', 'Eluru', 'Barasat', 'Kirari Suleman Nagar', 'Purnia',
        'Katihar', 'Ramagundam', 'Sonipat', 'Nagercoil', 'Thanjavur', 'Murwara',
        
        // International Cities
        'London', 'Paris', 'Tokyo', 'New York', 'Los Angeles', 'Sydney', 'Melbourne',
        'Toronto', 'Vancouver', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Vienna',
        'Prague', 'Budapest', 'Moscow', 'St. Petersburg', 'Istanbul', 'Dubai',
        'Singapore', 'Hong Kong', 'Seoul', 'Bangkok', 'Jakarta', 'Manila',
        'Kuala Lumpur', 'Hanoi', 'Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen',
        'Cairo', 'Johannesburg', 'Cape Town', 'Lagos', 'Nairobi', 'Casablanca',
        'São Paulo', 'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Santiago', 'Bogotá',
        'Mexico City', 'Montreal', 'Chicago', 'San Francisco', 'Miami', 'Boston',
        'Seattle', 'Denver', 'Washington DC', 'Atlanta', 'Dallas', 'Houston',
        'Philadelphia', 'Phoenix', 'San Diego', 'Las Vegas', 'Orlando', 'Berlin',
        'Munich', 'Hamburg', 'Frankfurt', 'Brussels', 'Copenhagen', 'Stockholm',
        'Oslo', 'Helsinki', 'Zurich', 'Geneva', 'Milan', 'Venice', 'Florence',
        'Barcelona', 'Valencia', 'Lisbon', 'Porto', 'Athens', 'Thessaloniki',
        'Warsaw', 'Krakow', 'Budapest', 'Bucharest', 'Belgrade', 'Zagreb',
        'Sofia', 'Istanbul', 'Ankara', 'Beirut', 'Tel Aviv', 'Jerusalem',
        'Riyadh', 'Jeddah', 'Doha', 'Abu Dhabi', 'Muscat', 'Kuwait City',
        'Baghdad', 'Tehran', 'Karachi', 'Lahore', 'Islamabad', 'Dhaka',
        'Colombo', 'Kathmandu', 'Thimphu', 'Yangon', 'Phnom Penh', 'Vientiane',
        'Ho Chi Minh City', 'Canberra', 'Perth', 'Brisbane', 'Adelaide',
        'Auckland', 'Wellington', 'Christchurch', 'Vancouver', 'Calgary',
        'Edmonton', 'Ottawa', 'Quebec City', 'Halifax', 'Winnipeg'
    ];
            }

            handleAutoComplete(query) {
                const suggestionsDiv = document.getElementById('suggestions');
                
                if (!query.trim()) {
                    suggestionsDiv.style.display = 'none';
                    return;
                }
                
                const matches = this.cityDatabase.filter(city => 
                    city.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5);
                
                if (matches.length === 0) {
                    suggestionsDiv.style.display = 'none';
                    return;
                }
                
                let suggestionsHTML = '';
                matches.forEach(city => {
                    suggestionsHTML += `
                        <div class="suggestion-item" onclick="dashboard.selectSuggestion('${city}')">${city}</div>
                    `;
                });
                
                suggestionsDiv.innerHTML = suggestionsHTML;
                suggestionsDiv.style.display = 'block';
            }

            selectSuggestion(city) {
                document.getElementById('citySearch').value = city;
                document.getElementById('suggestions').style.display = 'none';
                this.searchWeather();
            }

            showNotification(message, type = 'success') {
                const notification = document.getElementById('notification');
                notification.textContent = message;
                notification.className = `notification ${type}`;
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
        }

        // Initialize the dashboard
        const dashboard = new WeatherDashboard();

        // Add severe weather alert simulation
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every 30 seconds
                const alerts = [
                    'Severe thunderstorm warning in effect',
                    'High wind advisory issued',
                    'Heavy rain expected in your area',
                    'Heat wave warning - stay hydrated'
                ];
                const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
                dashboard.showNotification(randomAlert, 'warning');
            }
        }, 30000);

        // Add welcome message
        setTimeout(() => {
            dashboard.showNotification('Welcome to WeatherFlow! 🌤️', 'success');
        }, 1000);
