import "./WeatherCard.css";

function WeatherCard({ weather }) {
if (!weather) return null;

// FIX: handle nested location object properly
const locationName =
weather?.location?.city ||
weather?.location?.name ||
weather?.location ||
"Unknown Location";

const countryName =
weather?.location?.country || "";

const temperature =
weather?.temperature?.current ??
weather?.temperature ??
"N/A";

const feelsLike =
weather?.temperature?.feels_like ?? null;

const weatherCondition =
weather?.weather?.condition ??
weather?.weather_condition ??
"N/A";

const weatherIcon =
weather?.weather?.icon ||
weather?.icon ||
null;

return ( <div className="weather-card"> <div className="weather-header"> <div> <h2>
📍 {locationName}
{countryName && `, ${countryName}`} </h2>

```
      <p className="weather-subtitle">
        {weatherCondition}
      </p>
    </div>

    {weatherIcon && (
      <img
        src={weatherIcon}
        alt={weatherCondition}
        className="weather-icon"
      />
    )}
  </div>

  <div className="weather-content">

    <div className="weather-item">
      <span className="label">
        🌡 Temperature
      </span>

      <span className="value">
        {temperature} °C
      </span>
    </div>

    {feelsLike !== null && (
      <div className="weather-item">
        <span className="label">
          🤗 Feels Like
        </span>

        <span className="value">
          {feelsLike} °C
        </span>
      </div>
    )}

    <div className="weather-item">
      <span className="label">
        💧 Humidity
      </span>

      <span className="value">
        {weather?.humidity ?? "N/A"} %
      </span>
    </div>

    <div className="weather-item">
      <span className="label">
        ☁ Condition
      </span>

      <span className="value">
        {weatherCondition}
      </span>
    </div>

    <div className="weather-item">
      <span className="label">
        🌬 Wind Speed
      </span>

      <span className="value">
        {weather?.wind_kph ??
          weather?.wind_speed ??
          "N/A"} km/h
      </span>
    </div>

  </div>
</div>


);
}

export default WeatherCard;
