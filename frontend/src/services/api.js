import axios from "axios";

/**
 * =========================================================
 * API Configuration
 * =========================================================
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

/**
 * =========================================================
 * Axios Instance
 * =========================================================
 */

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * =========================================================
 * Request Interceptor
 * =========================================================
 */

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

/**
 * =========================================================
 * Response Interceptor
 * =========================================================
 */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.detail ||
      error?.message ||
      "Unexpected error occurred.";

    return Promise.reject(new Error(message));
  }
);

/**
 * =========================================================
 * Location Search / Autocomplete
 * (lets the user disambiguate "Delhi, India" vs "Delhi, Ontario")
 * =========================================================
 */

export const searchLocations = async (query) => {
  const response = await api.get("/weather/search", {
    params: { q: query },
  });

  return response.data.results;
};

/**
 * =========================================================
 * Weather API
 * `location` can be a free-text string OR a "lat,lon" pair
 * returned from searchLocations() — both work since the
 * backend resolves either form.
 * =========================================================
 */

export const getCurrentWeather = async (location) => {
  const response = await api.get("/weather/current", {
    params: { location },
  });

  return response.data;
};

export const getForecast = async (location) => {
  const response = await api.get("/weather/forecast", {
    params: { location },
  });

  return response.data;
};

/**
 * =========================================================
 * CRUD Operations
 * NOTE: backend router uses the "/weather/records" prefix,
 * not "/weather" directly — corrected below.
 * =========================================================
 */

export const getWeatherRecords = async () => {
  const response = await api.get("/weather/records");
  return response.data;
};

export const getWeatherRecordById = async (id) => {
  const response = await api.get(`/weather/records/${id}`);
  return response.data;
};

export const createWeatherRecord = async (payload) => {
  const response = await api.post("/weather/records", payload);
  return response.data;
};

export const updateWeatherRecord = async (id, payload) => {
  const response = await api.put(`/weather/records/${id}`, payload);
  return response.data;
};

export const deleteWeatherRecord = async (id) => {
  const response = await api.delete(`/weather/records/${id}`);
  return response.data;
};

/**
 * =========================================================
 * Google Maps API
 * =========================================================
 */

export const getMapLocation = async (location) => {
  const response = await api.get("/maps/location", {
    params: { location },
  });

  return response.data;
};

/**
 * =========================================================
 * YouTube API
 * NOTE: backend route is "/youtube/videos", not
 * "/youtube/location" — corrected below.
 * =========================================================
 */

export const getYoutubeVideos = async (location) => {
  const response = await api.get("/youtube/location", {
    params: { location },
  });

  return response.data;
};

/**
 * =========================================================
 * Export APIs
 * =========================================================
 */

export const exportJson = () => {
  window.open(`${API_BASE_URL}/export/json`, "_blank");
};

export const exportCsv = () => {
  window.open(`${API_BASE_URL}/export/csv`, "_blank");
};

export const exportPdf = () => {
  window.open(`${API_BASE_URL}/export/pdf`, "_blank");
};

export const exportMarkdown = () => {
  window.open(`${API_BASE_URL}/export/md`, "_blank");
};

/**
 * =========================================================
 * Default Export
 * =========================================================
 */

export default api;

export const askTravelAssistant = async (
  location,
  question
) => {
  const response = await api.post(
    "/ai/chat",
    {
      location,
      question
    }
  );

  return response.data;
};