  // DOM Elements
        const cityInput = document.getElementById('city-input');
        const cityInputBtn = document.getElementById('city-input-btn');
        const loading = document.getElementById('loading');
        const dashboard = document.getElementById('dashboard');
        const notification = document.getElementById('welcome-notification');
        const closeNotificationBtn = document.getElementById('close-notification');
        const realTimeElement = document.getElementById('real-time');
        
        // Update real-time clock
        function updateRealTime() {
            const now = moment();
            realTimeElement.textContent = now.format('h:mm:ss A');
        }
        
        // Initialize with default city
        document.addEventListener('DOMContentLoaded', function() {
            // Show welcome notification
            setTimeout(() => {
                notification.classList.add('show');
            }, 1000);
            
            // Start real-time clock
            updateRealTime();
            setInterval(updateRealTime, 1000);
            
            // Load default weather for Kolkata, India
            weatherFn('Kolkata');
        });
        
        // Close notification
        closeNotificationBtn.addEventListener('click', function() {
            notification.classList.remove('show');
        });
        
        // Search button event
        cityInputBtn.addEventListener('click', function() {
            const city = cityInput.value.trim();
            if (city) {
                weatherFn(city);
            }
        });
        
        // Enter key in input field
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const city = cityInput.value.trim();
                if (city) {
                    weatherFn(city);
                }
            }
        });
        
        // Main weather function
        async function weatherFn(cName) {
            // Show loading spinner
            dashboard.style.display = 'none';
            loading.style.display = 'block';
            
            try {
                // Simulate API delay for demo
                await new Promise(resolve => setTimeout(resolve, 1200));
                
                // In a real app, you would fetch from the API:
                /*
                const weatherResponse = await fetch(`${weatherUrl}?q=${cName}&appid=${apiKey}&units=metric`);
                const weatherData = await weatherResponse.json();
                
                const forecastResponse = await fetch(`${forecastUrl}?q=${cName}&appid=${apiKey}&units=metric`);
                const forecastData = await forecastResponse.json();
                
                if (weatherResponse.ok && forecastResponse.ok) {
                    await weatherShowFn(weatherData, forecastData);
                    renderChart(forecastData);
                    renderHourlyForecast(forecastData);
                } else {
                    alert('City not found. Please try again.');
                }
                */
                
                // For demo purposes, generate realistic weather data
                const weatherData = generateWeatherData(cName);
                const forecastData = generateForecastData();
                
                // Update UI with generated data
                weatherShowFn(weatherData, forecastData);
                renderChart(forecastData);
                renderHourlyForecast(forecastData);
                
            } catch (error) {
                console.error('Error fetching weather data:', error);
                alert('An error occurred while fetching weather data.');
            } finally {
                // Hide loading spinner
                setTimeout(() => {
                    loading.style.display = 'none';
                    dashboard.style.display = 'grid';
                }, 500);
            }
        }
        
        // Generate realistic weather data for demo
        function generateWeatherData(city) {
            // City-to-country mapping with coordinates
            const cityMapping = {
                "new york": { country: "United States", lat: 40.71, lon: -74.01 },
                "los angeles": { country: "United States", lat: 34.05, lon: -118.24 },
                "chicago": { country: "United States", lat: 41.88, lon: -87.63 },
                "houston": { country: "United States", lat: 29.76, lon: -95.37 },
                "phoenix": { country: "United States", lat: 33.45, lon: -112.07 },
                "london": { country: "United Kingdom", lat: 51.51, lon: -0.13 },
                "tokyo": { country: "Japan", lat: 35.68, lon: 139.69 },
                "sydney": { country: "Australia", lat: -33.87, lon: 151.21 },
                "dubai": { country: "United Arab Emirates", lat: 25.20, lon: 55.27 },
                "kolkata": { country: "India", lat: 22.57, lon: 88.36 },
                "mumbai": { country: "India", lat: 19.08, lon: 72.88 },
                "delhi": { country: "India", lat: 28.70, lon: 77.10 },
                "bangalore": { country: "India", lat: 12.97, lon: 77.59 },
                "hyderabad": { country: "India", lat: 17.39, lon: 78.49 },
                "chennai": { country: "India", lat: 13.08, lon: 80.27 },
                "pune": { country: "India", lat: 18.52, lon: 73.86 },
                "jaipur": { country: "India", lat: 26.91, lon: 75.79 },
                "lucknow": { country: "India", lat: 26.85, lon: 80.95 },
                "kanpur": { country: "India", lat: 26.45, lon: 80.33 },
                "nagpur": { country: "India", lat: 21.15, lon: 79.09 },
                "visakhapatnam": { country: "India", lat: 17.69, lon: 83.22 },
                "indore": { country: "India", lat: 22.72, lon: 75.86 },
                "bhopal": { country: "India", lat: 23.26, lon: 77.41 },
                "patna": { country: "India", lat: 25.59, lon: 85.14 },
                "vadodara": { country: "India", lat: 22.31, lon: 73.18 },
                "ghaziabad": { country: "India", lat: 28.67, lon: 77.45 },
                "ludhiana": { country: "India", lat: 30.90, lon: 75.86 },
                "agra": { country: "India", lat: 27.18, lon: 78.01 },
                "nashik": { country: "India", lat: 20.00, lon: 73.79 },
                "faridabad": { country: "India", lat: 28.41, lon: 77.31 },
                "meerut": { country: "India", lat: 28.98, lon: 77.71 },
                "rajkot": { country: "India", lat: 22.30, lon: 70.80 },
                "varanasi": { country: "India", lat: 25.32, lon: 82.97 },
                "srinagar": { country: "India", lat: 34.08, lon: 74.80 },
                "aurangabad": { country: "India", lat: 19.88, lon: 75.34 },
                "ranchi": { country: "India", lat: 23.34, lon: 85.31 },
                "coimbatore": { country: "India", lat: 11.02, lon: 76.96 },
                "jabalpur": { country: "India", lat: 23.17, lon: 79.94 },
                "gwalior": { country: "India", lat: 26.22, lon: 78.18 },
                "vijayawada": { country: "India", lat: 16.51, lon: 80.65 },
                "madurai": { country: "India", lat: 9.93, lon: 78.12 },
                "raipur": { country: "India", lat: 21.25, lon: 81.63 },
                "guwahati": { country: "India", lat: 26.14, lon: 91.74 },
                "bhubaneswar": { country: "India", lat: 20.30, lon: 85.82 },
                "dehradun": { country: "India", lat: 30.32, lon: 78.03 },
                "barrackpore": { country: "India", lat: 22.76, lon: 88.37 },
                "paris": { country: "France", lat: 48.85, lon: 2.35 },
                "berlin": { country: "Germany", lat: 52.52, lon: 13.40 },
                "moscow": { country: "Russia", lat: 55.76, lon: 37.62 },
                "cairo": { country: "Egypt", lat: 30.04, lon: 31.24 },
                "shanghai": { country: "China", lat: 31.23, lon: 121.47 },
                "beijing": { country: "China", lat: 39.90, lon: 116.41 },
                "guangzhou": { country: "China", lat: 23.13, lon: 113.26 },
                "shenzhen": { country: "China", lat: 22.54, lon: 114.05 },
                "chengdu": { country: "China", lat: 30.66, lon: 104.07 },
                "madrid": { country: "Spain", lat: 40.42, lon: -3.70 },
                "barcelona": { country: "Spain", lat: 41.39, lon: 2.17 },
                "valencia": { country: "Spain", lat: 39.47, lon: -0.38 },
                "seville": { country: "Spain", lat: 37.39, lon: -5.99 },
                "rome": { country: "Italy", lat: 41.90, lon: 12.49 },
                "milan": { country: "Italy", lat: 45.46, lon: 9.19 },
                "naples": { country: "Italy", lat: 40.85, lon: 14.26 },
                "turin": { country: "Italy", lat: 45.07, lon: 7.69 },
                "sao paulo": { country: "Brazil", lat: -23.55, lon: -46.63 },
                "rio de janeiro": { country: "Brazil", lat: -22.91, lon: -43.17 },
                "brasilia": { country: "Brazil", lat: -15.78, lon: -47.93 },
                "mexico city": { country: "Mexico", lat: 19.43, lon: -99.13 },
                "guadalajara": { country: "Mexico", lat: 20.66, lon: -103.35 },
                "monterrey": { country: "Mexico", lat: 25.69, lon: -100.31 },
                "toronto": { country: "Canada", lat: 43.65, lon: -79.38 },
                "montreal": { country: "Canada", lat: 45.50, lon: -73.57 },
                "vancouver": { country: "Canada", lat: 49.28, lon: -123.12 },
                "calgary": { country: "Canada", lat: 51.05, lon: -114.07 },
                "ottawa": { country: "Canada", lat: 45.42, lon: -75.70 },
                "seoul": { country: "South Korea", lat: 37.57, lon: 126.98 },
                "busan": { country: "South Korea", lat: 35.18, lon: 129.08 },
                "incheon": { country: "South Korea", lat: 37.46, lon: 126.71 },
                "bangkok": { country: "Thailand", lat: 13.76, lon: 100.50 },
                "singapore": { country: "Singapore", lat: 1.35, lon: 103.82 },
                "kuala lumpur": { country: "Malaysia", lat: 3.14, lon: 101.69 },
                "jakarta": { country: "Indonesia", lat: -6.21, lon: 106.85 },
                "manila": { country: "Philippines", lat: 14.60, lon: 120.98 },
                "ho chi minh city": { country: "Vietnam", lat: 10.82, lon: 106.63 },
                "hanoi": { country: "Vietnam", lat: 21.03, lon: 105.85 },
                "karachi": { country: "Pakistan", lat: 24.86, lon: 67.00 },
                "lahore": { country: "Pakistan", lat: 31.55, lon: 74.34 },
                "islamabad": { country: "Pakistan", lat: 33.68, lon: 73.05 },
                "dhaka": { country: "Bangladesh", lat: 23.81, lon: 90.41 },
                "colombo": { country: "Sri Lanka", lat: 6.93, lon: 79.85 },
                "cairo": { country: "Egypt", lat: 30.04, lon: 31.24 },
                "riyadh": { country: "Saudi Arabia", lat: 24.71, lon: 46.67 },
                "jeddah": { country: "Saudi Arabia", lat: 21.54, lon: 39.18 },
                "istanbul": { country: "Turkey", lat: 41.01, lon: 28.98 },
                "ankara": { country: "Turkey", lat: 39.93, lon: 32.86 },
                "buenos aires": { country: "Argentina", lat: -34.60, lon: -58.38 },
                "lima": { country: "Peru", lat: -12.05, lon: -77.03 },
                "bogota": { country: "Colombia", lat: 4.71, lon: -74.07 },
                "lagos": { country: "Nigeria", lat: 6.52, lon: 3.38 },
                "nairobi": { country: "Kenya", lat: -1.29, lon: 36.82 },
                "addis ababa": { country: "Ethiopia", lat: 9.03, lon: 38.75 },
                "athens": { country: "Greece", lat: 37.98, lon: 23.73 },
                "lisbon": { country: "Portugal", lat: 38.72, lon: -9.14 },
                "warsaw": { country: "Poland", lat: 52.23, lon: 21.01 },
                "prague": { country: "Czech Republic", lat: 50.08, lon: 14.44 },
                "budapest": { country: "Hungary", lat: 47.50, lon: 19.04 },
                "vienna": { country: "Austria", lat: 48.21, lon: 16.37 },
                "stockholm": { country: "Sweden", lat: 59.33, lon: 18.07 },
                "oslo": { country: "Norway", lat: 59.91, lon: 10.75 },
                "copenhagen": { country: "Denmark", lat: 55.68, lon: 12.57 },
                "helsinki": { country: "Finland", lat: 60.17, lon: 24.94 },
                "kyiv": { country: "Ukraine", lat: 50.45, lon: 30.52 },
                "minsk": { country: "Belarus", lat: 53.90, lon: 27.57 },
                "almaty": { country: "Kazakhstan", lat: 43.22, lon: 76.85 },
                "auckland": { country: "New Zealand", lat: -36.85, lon: 174.76 }
            };
            
            // Function to get city data from mapping
            function getCityData(cityName) {
                if (!cityName) return null;
                
                // Convert to lowercase for case-insensitive matching
                const normalizedCity = cityName.toLowerCase().trim();
                
                // Check exact match first
                if (cityMapping[normalizedCity]) {
                    return cityMapping[normalizedCity];
                }
                
                // Check for partial matches
                for (const [city, data] of Object.entries(cityMapping)) {
                    if (normalizedCity.includes(city) || city.includes(normalizedCity)) {
                        return data;
                    }
                }
                
                // Default fallback for unknown cities
                return {
                    country: "Unknown",
                    lat: 40.71 + (Math.random() - 0.5) * 10,
                    lon: -74.01 + (Math.random() - 0.5) * 10
                };
            }
            
            const cityData = getCityData(city);
            
            const conditions = [
                { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
                { id: 801, main: "Clouds", description: "few clouds", icon: "02d" },
                { id: 803, main: "Clouds", description: "broken clouds", icon: "04d" },
                { id: 500, main: "Rain", description: "light rain", icon: "10d" },
                { id: 300, main: "Drizzle", description: "light intensity drizzle", icon: "09d" },
                { id: 200, main: "Thunderstorm", description: "thunderstorm with light rain", icon: "11d" }
            ];
            
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            
            return {
                name: city,
                sys: {
                    country: cityData.country,
                    sunrise: moment().subtract(4, 'hours').unix(),
                    sunset: moment().add(8, 'hours').unix()
                },
                main: {
                    temp: 20 + Math.floor(Math.random() * 15),
                    pressure: 1000 + Math.floor(Math.random() * 20),
                    humidity: 40 + Math.floor(Math.random() * 50),
                    feels_like: 22 + Math.floor(Math.random() * 10)
                },
                weather: [condition],
                wind: {
                    speed: (2 + Math.random() * 8).toFixed(1),
                    deg: Math.floor(Math.random() * 360)
                },
                visibility: (5 + Math.random() * 15).toFixed(1) * 1000,
                coord: {
                    lat: cityData.lat,
                    lon: cityData.lon
                },
                dt: moment().unix()
            };
        }
        
        // Generate forecast data for demo
        function generateForecastData() {
            const list = [];
            const now = moment();
            
            for (let i = 0; i < 8; i++) {
                const time = now.clone().add(i * 3, 'hours');
                const temp = 18 + Math.floor(Math.random() * 10) + (i > 4 ? -2 : 0);
                
                list.push({
                    dt_txt: time.format(),
                    main: {
                        temp: temp,
                        temp_min: temp - 2,
                        temp_max: temp + 2
                    },
                    weather: [{
                        id: 800 + Math.floor(Math.random() * 100),
                        main: i % 3 === 0 ? "Rain" : "Clouds",
                        description: i % 3 === 0 ? "light rain" : "scattered clouds",
                        icon: i % 3 === 0 ? "10d" : "03d"
                    }],
                    pop: i % 3 === 0 ? 0.4 : 0.1
                });
            }
            
            return { list };
        }
        
        // Display weather data
        async function weatherShowFn(data, forecastData) {
            // City name and date
            document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
            document.getElementById('date').textContent = moment().format('dddd, MMMM D, YYYY');
            
            // Temperature and description
            document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
            document.getElementById('description').textContent = data.weather[0].description;
            
            // Weather icon
            const weatherIcon = document.querySelector('.weather-icon-large');
            const iconClass = getWeatherIcon(data.weather[0].id, data.weather[0].icon);
            weatherIcon.className = `weather-icon-large ${iconClass}`;
            
            // Weather details
            document.getElementById('wind-speed').textContent = `${data.wind.speed} m/s`;
            document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
            document.getElementById('sunrise').textContent = moment.unix(data.sys.sunrise).format('h:mm A');
            document.getElementById('sunset').textContent = moment.unix(data.sys.sunset).format('h:mm A');
            document.getElementById('humidity').textContent = `${data.main.humidity}%`;
            document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
            
            // UV Index (simulated)
            const uvIndex = (2 + Math.random() * 8).toFixed(1);
            let uvText = "Low";
            if (uvIndex > 5.9) uvText = "High";
            else if (uvIndex > 2.9) uvText = "Moderate";
            document.getElementById('uv-index').textContent = `${uvIndex} (${uvText})`;
            
            // AQI (simulated)
            const aqi = Math.floor(Math.random() * 150);
            let aqiStatus = "Good - Air quality is satisfactory";
            let aqiClass = "aqi-good";
            
            if (aqi > 100) {
                aqiStatus = "Unhealthy for sensitive groups";
                aqiClass = "aqi-unhealthy";
            } else if (aqi > 50) {
                aqiStatus = "Moderate - Air quality is acceptable";
                aqiClass = "aqi-moderate";
            }
            
            document.getElementById('aqi').textContent = aqi;
            document.getElementById('aqi').className = `aqi-value ${aqiClass}`;
            document.getElementById('aqi-status').textContent = aqiStatus;
            
            // Calculate rain chance
            const rainChance = await calculateRainChance(data.coord.lat, data.coord.lon);
            document.getElementById('rain-chance').textContent = `${rainChance}%`;
        }
        
        // Get appropriate weather icon class
        function getWeatherIcon(conditionCode, iconCode) {
            const isDay = iconCode.includes('d');
            
            // Clear
            if (conditionCode === 800) {
                return isDay ? 'fas fa-sun' : 'fas fa-moon';
            }
            
            // Clouds
            if (conditionCode >= 801 && conditionCode <= 804) {
                return isDay ? 'fas fa-cloud-sun' : 'fas fa-cloud-moon';
            }
            
            // Rain
            if (conditionCode >= 500 && conditionCode <= 531) {
                return 'fas fa-cloud-rain';
            }
            
            // Thunderstorm
            if (conditionCode >= 200 && conditionCode <= 232) {
                return 'fas fa-bolt';
            }
            
            // Snow
            if (conditionCode >= 600 && conditionCode <= 622) {
                return 'fas fa-snowflake';
            }
            
            // Atmosphere
            if (conditionCode >= 701 && conditionCode <= 781) {
                return 'fas fa-smog';
            }
            
            // Default
            return 'fas fa-cloud';
        }
        
        // Calculate chance of rain (simulated for demo)
        async function calculateRainChance(lat, lon) {
            return Math.floor(Math.random() * 50);
        }
        
        // Render temperature chart
        function renderChart(data) {
            const ctx = document.getElementById('temperature-chart').getContext('2d');
            
            // Get next 24 hours data (every 3 hours)
            const labels = [];
            const temps = [];
            
            for (let i = 0; i < 8; i++) {
                const forecast = data.list[i];
                const time = moment(forecast.dt_txt).format('h A');
                labels.push(time);
                temps.push(forecast.main.temp);
            }
            
            // Destroy existing chart if it exists
            if (window.tempChart) {
                window.tempChart.destroy();
            }
            
            // Create new chart
            window.tempChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: temps,
                        backgroundColor: 'rgba(52, 168, 83, 0.2)',
                        borderColor: 'rgba(52, 168, 83, 1)',
                        borderWidth: 3,
                        pointBackgroundColor: 'rgba(52, 168, 83, 1)',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            titleColor: '#202124',
                            bodyColor: '#202124',
                            borderColor: '#e0e0e0',
                            borderWidth: 1,
                            padding: 15,
                            displayColors: false,
                            titleFont: {
                                size: 16,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 14
                            },
                            callbacks: {
                                label: function(context) {
                                    return `Temperature: ${context.parsed.y}°C`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#5f6368',
                                font: {
                                    size: 12,
                                    weight: '500'
                                }
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                color: '#5f6368',
                                font: {
                                    size: 12,
                                    weight: '500'
                                },
                                callback: function(value) {
                                    return value + '°';
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    }
                }
            });
        }
        
        // Render hourly forecast
        function renderHourlyForecast(data) {
            const container = document.getElementById('hourly-forecast');
            container.innerHTML = '';
            
            // Get next 6 hours
            for (let i = 0; i < 6; i++) {
                const forecast = data.list[i];
                const time = moment(forecast.dt_txt).format('h A');
                const temp = Math.round(forecast.main.temp);
                const iconCode = forecast.weather[0].id;
                const iconClass = getWeatherIcon(iconCode, forecast.weather[0].icon);
                
                const hourCard = document.createElement('div');
                hourCard.className = 'hour-card';
                hourCard.innerHTML = `
                    <p>${time}</p>
                    <i class="${iconClass} hour-icon"></i>
                    <p class="hour-temp">${temp}°</p>
                    <p>${forecast.weather[0].description}</p>
                `;
                
                container.appendChild(hourCard);
            }
        }