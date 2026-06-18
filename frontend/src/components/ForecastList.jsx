import "./ForecastList.css";

function ForecastList({ forecast }) {
  if (
    !forecast ||
    !Array.isArray(forecast) ||
    forecast.length === 0
  ) {
    return null;
  }

  return (
    <div className="forecast-container">
      <h2>5-Day Weather Forecast</h2>

      <div className="forecast-grid">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="forecast-card"
          >
            <h3>{day.date ?? "N/A"}</h3>

            {day.icon && (
              <img
                src={day.icon}
                alt={day.condition}
                className="forecast-icon"
              />
            )}

            <p>
              <strong>Avg Temp:</strong>{" "}
              {day.avg_temp ?? "N/A"}°C
            </p>

            <p>
              <strong>Max Temp:</strong>{" "}
              {day.max_temp ?? "N/A"}°C
            </p>

            <p>
              <strong>Min Temp:</strong>{" "}
              {day.min_temp ?? "N/A"}°C
            </p>

            <p>
              <strong>Condition:</strong>{" "}
              {day.condition ?? "N/A"}
            </p>

            <p>
              <strong>Humidity:</strong>{" "}
              {day.humidity ?? "N/A"}%
            </p>

            <p>
              <strong>Wind:</strong>{" "}
              {day.wind_speed ?? "N/A"} km/h
            </p>

            <p>
              <strong>Rain Chance:</strong>{" "}
              {day.rain_chance ?? "N/A"}%
            </p>

            <p>
              <strong>UV Index:</strong>{" "}
              {day.uv_index ?? "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ForecastList;