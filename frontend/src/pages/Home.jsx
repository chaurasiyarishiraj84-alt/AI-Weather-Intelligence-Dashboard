import ExportPanel from "../components/ExportPanel";
import TravelAssistant from "../components/TravelAssistant";
import "./Home.css";
import { useState } from "react";

import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import ForecastList from "../components/ForecastList";
import MapView from "../components/MapView";
import YouTubePanel from "../components/YouTubePanel";

import {
  getCurrentWeather,
  getForecast,
  getMapLocation,
  getYoutubeVideos,
} from "../services/api";

function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (location) => {
    try {
      setLoading(true);
      setError("");

      const weatherResponse = await getCurrentWeather(location);
      setWeatherData(weatherResponse);

      const forecastResponse = await getForecast(location);

      const normalizedForecast =
        Array.isArray(forecastResponse)
          ? forecastResponse
          : forecastResponse?.forecast || [];

      setForecastData(normalizedForecast);

      const mapResponse = await getMapLocation(location);
      setMapData(mapResponse);

      const youtubeResponse = await getYoutubeVideos(location);

      const normalizedVideos =
        Array.isArray(youtubeResponse)
          ? youtubeResponse
          : youtubeResponse?.videos || [];

      setYoutubeVideos(normalizedVideos);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };


return (
  <div className="home-container">
    <div className="hero-section">
      <h1>🌦 AI Weather Intelligence Dashboard</h1>

      <p>
        Real-time weather forecasts, location intelligence,
        interactive maps, video insights and exportable reports.
      </p>
    </div>

    <div className="search-section">
      <SearchBar onSearch={handleSearch} />
    </div>

    {loading && (
      <div className="loading-text">
        Loading weather intelligence...
      </div>
    )}

    {error && (
      <p className="error-text">
        {error}
      </p>
    )}

    {!weatherData && !loading && (
      <div className="welcome-card">
        <h2>🌍 Welcome</h2>

        <p>
          Search any city, landmark, airport or destination
          to unlock weather intelligence.
        </p>

        <div className="welcome-features">
          <div>🌤 Current Weather</div>
          <div>📅 5 Day Forecast</div>
          <div>📊 Weather Insights</div>
          <div>🗺 Interactive Maps</div>
          <div>🎥 Travel Videos</div>
          <div>🤖 AI Travel Assistant</div>
          <div>📁 Export Reports</div>
        </div>
      </div>
    )}

    {weatherData && (
      <>
        <div className="top-dashboard">

          <div>
            <WeatherCard weather={weatherData} />

            <TravelAssistant
              location={
                weatherData?.location?.city ||
                weatherData?.location?.name ||
                "Unknown Location"
              }
            />
          </div>

          <div className="analytics-placeholder">
            <h2>📊 Weather Insights</h2>

            <div className="insights-grid">

              <div className="insight-card">
                <span>🌡 Highest Temperature</span>

                <strong>
                  {Math.max(
                    ...forecastData.map(
                      (d) =>
                        d.max_temp ||
                        d.temperature?.current ||
                        0
                    )
                  )}
                  °C
                </strong>
              </div>

              <div className="insight-card">
                <span>💧 Average Humidity</span>

                <strong>
                  {Math.round(
                    forecastData.reduce(
                      (sum, d) => sum + (d.humidity || 0),
                      0
                    ) / forecastData.length
                  )}
                  %
                </strong>
              </div>

              <div className="insight-card">
                <span>🌧 Rain Probability</span>

                <strong>
                  {Math.max(
                    ...forecastData.map(
                      (d) => Number(d.rain_chance || 0)
                    )
                  )}
                  %
                </strong>
              </div>

              <div className="insight-card">
                <span>💨 Strongest Wind</span>

                <strong>
                  {Math.max(
                    ...forecastData.map(
                      (d) => Number(d.wind_speed || 0)
                    )
                  )}
                  km/h
                </strong>
              </div>

            </div>
          </div>

        </div>

        <div className="forecast-section">
          <ForecastList forecast={forecastData} />
        </div>

        <div className="map-section">
          <MapView mapData={mapData} />
        </div>

        <div className="youtube-section">
          <YouTubePanel videos={youtubeVideos} />
        </div>

        <div className="export-section">
          <ExportPanel />
        </div>
              <footer className="footer">
        <h3>👨‍💻 Developed By</h3>

        <p>
          <strong>Rishiraj Chaurasiya</strong>
        </p>

        <p>
          LinkedIn:
          <a
            href="https://www.linkedin.com/in/rishirajchaurasiya"
            target="_blank"
            rel="noreferrer"
          >
            View Profile
          </a>
        </p>

        <br />

        <h3>About PM Accelerator</h3>

        <p>
          PM Accelerator helps aspiring Product Managers,
          AI Engineers, UI/UX Designers and Data Scientists
          gain real-world experience through mentorship,
          projects and industry-focused training.
        </p>

        <p>
          This project was developed as part of the
          PM Accelerator Internship Assessment.
        </p>
      </footer>
      </>
    )}
  </div>
  
);
}

export default Home;

