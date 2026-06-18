import { useEffect, useState } from "react";

import {
  getWeatherRecords,
  deleteWeatherRecord,
} from "../services/api";

import "./HistoryTable.css";

function HistoryTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const data = await getWeatherRecords();

        if (Array.isArray(data)) {
          setRecords(data);
        } else {
          setRecords([]);
        }
      } catch (err) {
        setError(
          err.message || "Failed to load weather records."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteWeatherRecord(id);

      setRecords((prevRecords) =>
        prevRecords.filter(
          (record) => record.id !== id
        )
      );
    } catch (err) {
      alert(
        err.message || "Failed to delete record."
      );
    }
  };

  if (loading) {
    return <p>Loading weather history...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="history-container">
      <h2>Weather History</h2>

      {records.length === 0 ? (
        <p>No weather records found.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Temperature</th>
              <th>Condition</th>
              <th>Humidity</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>

                <td>{record.location}</td>

                <td>
                  {record.temperature} °C
                </td>

                <td>
                  {record.weather_condition}
                </td>

                <td>
                  {record.humidity} %
                </td>

                <td>
                  {new Date(
                    record.created_at
                  ).toLocaleString()}
                </td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(record.id)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HistoryTable;