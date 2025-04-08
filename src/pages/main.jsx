import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import "../css/main.css";

function WeatherApp() {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [viewMode, setViewMode] = useState('daily');

    const apiKey = '0b08ddd8b5c04645b1e170224252803';
    const location = 'auto:ip';
    const days = 3;

    const fetchWeather = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios({
                method: 'get',
                url: 'https://api.weatherapi.com/v1/forecast.json',
                params: {
                    key: apiKey,
                    q: location,
                    days: days,
                    lang: 'ru'
                }
            });

            setForecast(response.data);
            setLastUpdated(new Date());
            if (!selectedDay && response.data?.forecast?.forecastday?.length > 0) {
                setSelectedDay(response.data.forecast.forecastday[0]);
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || "Не удалось получить прогноз погоды");
            console.error('Ошибка при получении данных:', err);
        } finally {
            setLoading(false);
        }
    }, [apiKey, location, days, selectedDay]);

    useEffect(() => {
        fetchWeather();
        const intervalID = setInterval(fetchWeather, 60000);
        return () => clearInterval(intervalID);
    }, [fetchWeather]);

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setViewMode('hourly');
    };

    const toggleViewMode = () => {
        setViewMode(viewMode === 'daily' ? 'hourly' : 'daily');
    };

    if (loading) return (
        <div className="weather-loading">
            <div className="loader"></div>
            <p>Загружаем прогноз погоды...</p>
        </div>
    );

    if (error) return (
        <div className="weather-error">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button onClick={fetchWeather}>Попробовать снова</button>
        </div>
    );

    if (!forecast) return null;

    return (
        <div className={`weather-app ${forecast.current.is_day ? 'day-theme' : 'night-theme'}`}>
            <div className="weather-card">
                <div className="location">
                    <h2>{forecast.location.name}</h2>
                    <p>{forecast.location.region}, {forecast.location.country}</p>
                    <p className="last-updated">
                        Время: {lastUpdated?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--:--'}
                        <br />
                        Дата: {lastUpdated?.toLocaleDateString('ru-RU') || 'неизвестно'}
                    </p>
                </div>

                <div className="current-weather">
                    <div className="weather-main">
                        <div className="temperature">
                            <span className="temp-value">{forecast.current.temp_c}</span>
                            <span className="temp-unit">°C</span>
                        </div>
                        <img
                            src={`https:${forecast.current.condition.icon.replace('64x64', '128x128')}`}
                            alt={forecast.current.condition.text}
                            className="weather-icon"
                        />
                    </div>

                    <div className="weather-details">
                        <div className="detail">
                            <span>Ощущается</span>
                            <span>{forecast.current.feelslike_c}°C</span>
                        </div>
                        <div className="detail">
                            <span>Влажность</span>
                            <span>{forecast.current.humidity}%</span>
                        </div>
                        <div className="detail">
                            <span>Ветер</span>
                            <span>{forecast.current.wind_kph} км/ч</span>
                        </div>
                        <div className="detail">
                            <span>Давление</span>
                            <span>{forecast.current.pressure_mb} мбар</span>
                        </div>
                    </div>
                </div>

                <div className="forecast-container">
                    <div className="forecast-header">
                        <h3>Прогноз на {days} дня</h3>
                        <button onClick={toggleViewMode} className="view-toggle">
                            {viewMode === 'daily' ? 'Почасовой' : 'Дневной'}
                        </button>
                    </div>

                    {viewMode === 'daily' ? (
                        <div className="forecast-days">
                            {forecast.forecast.forecastday.map((day, index) => (
                                <div
                                    key={index}
                                    className={`forecast-day ${selectedDay?.date === day.date ? 'selected' : ''}`}
                                    onClick={() => handleDayClick(day)}
                                >
                                    <h4>
                                        {new Date(day.date).toLocaleDateString('ru-RU', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </h4>
                                    <img
                                        src={`https:${day.day.condition.icon}`}
                                        alt={day.day.condition.text}
                                    />
                                    <div className="forecast-temp">
                                        <span className="max-temp">{day.day.maxtemp_c}°</span>
                                        <span className="min-temp">{day.day.mintemp_c}°</span>
                                    </div>
                                    <p>{day.day.condition.text}</p>
                                    <div className="forecast-details">
                                        <span>🌧️ {day.day.daily_chance_of_rain}%</span>
                                        <span>💨 {day.day.maxwind_kph} км/ч</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="hourly-forecast">
                            <h4 className="selected-day-title">
                                {new Date(selectedDay.date).toLocaleDateString('ru-RU', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </h4>

                            <div className="hourly-scroll-container">
                                {selectedDay.hour.map((hour, index) => {
                                    const hourDate = new Date(hour.time);
                                    const isCurrentHour = new Date().getHours() === hourDate.getHours() &&
                                        new Date().toDateString() === hourDate.toDateString();

                                    return (
                                        <div
                                            key={index}
                                            className={`hour-item ${isCurrentHour ? 'current-hour' : ''}`}
                                        >
                                            <p className="hour-time">{hourDate.getHours()}:00</p>
                                            <img
                                                src={`https:${hour.condition.icon}`}
                                                alt={hour.condition.text}
                                                className="hour-icon"
                                            />
                                            <p className="hour-temp">{hour.temp_c}°</p>
                                            <p className="hour-rain">💧 {hour.chance_of_rain}%</p>
                                            <p className="hour-wind">💨 {hour.wind_kph} км/ч</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WeatherApp;