import { useEffect, useRef, useState } from "react";
import { searchLocations } from "../services/api";

/**
 * SearchBar Component
 * - Debounced autocomplete dropdown via /weather/search
 * - User picks an exact place ("Delhi, Delhi, India" vs
 *   "Delhi, Ontario, Canada") so weather is never ambiguous
 * - Falls back to plain free-text search on Enter/Search click
 *   if the user ignores the dropdown
 */
function SearchBar({ onSearch }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // ── Debounced autocomplete ──────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = input.trim();

    debounceRef.current = setTimeout(async () => {
      if (trimmed.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const results = await searchLocations(trimmed);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [input]);

  // ── Close dropdown on outside click ─────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Pick a suggestion: send exact lat,lon ───
  const handleSelect = (place) => {
    setInput(place.display_name);
    setShowDropdown(false);
    setError("");
    onSearch(`${place.lat},${place.lon}`, place.display_name);
  };

  // ── Manual submit (Enter / button) ──────────
  const handleSubmit = () => {
    const trimmed = input.trim();

    if (!trimmed) {
      setError("Please enter a location");
      return;
    }

    setError("");
    setShowDropdown(false);
    onSearch(trimmed, trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") setShowDropdown(false);
  };

  return (
    <div style={styles.container} ref={wrapperRef}>
      <h2 style={styles.title}>Search Weather</h2>

      <div style={styles.box}>
        <div style={styles.inputWrapper}>
          <input
            type="text"
            placeholder="Enter city, zip, landmark, airport..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            style={styles.input}
            autoComplete="off"
          />

          {showDropdown && (
            <ul style={styles.dropdown}>
              {loadingSuggestions && (
                <li style={styles.dropdownLoading}>Searching...</li>
              )}

              {!loadingSuggestions &&
                suggestions.map((place, idx) => (
                  <li
                    key={`${place.lat}-${place.lon}-${idx}`}
                    style={styles.dropdownItem}
                    onClick={() => handleSelect(place)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span style={styles.dropdownCity}>{place.name}</span>
                    <span style={styles.dropdownDetail}>
                      {place.region ? `${place.region}, ` : ""}
                      {place.country}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <button onClick={handleSubmit} style={styles.button}>
          Search
        </button>
      </div>

      {suggestions.length > 1 && showDropdown && (
        <p style={styles.hint}>
          Multiple matches found — pick the exact one above for accurate weather.
        </p>
      )}

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: "20px",
    textAlign: "center",
  },
  title: {
    marginBottom: "10px",
  },
  box: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  inputWrapper: {
    position: "relative",
    width: "300px",
  },
  input: {
    padding: "10px",
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    boxSizing: "border-box",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "6px",
    listStyle: "none",
    margin: 0,
    padding: "4px 0",
    maxHeight: "220px",
    overflowY: "auto",
    zIndex: 20,
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    textAlign: "left",
  },
  dropdownLoading: {
    padding: "8px 12px",
    color: "#888",
    fontSize: "13px",
  },
  dropdownItem: {
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  dropdownCity: {
    fontSize: "14px",
    color: "#1a1a1a",
    fontWeight: 500,
  },
  dropdownDetail: {
    fontSize: "12px",
    color: "#777",
  },
  button: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#4f46e5",
    color: "white",
    cursor: "pointer",
  },
  hint: {
    fontSize: "12px",
    color: "#666",
    marginTop: "6px",
  },
  error: {
    color: "red",
    marginTop: "8px",
  },
};

export default SearchBar;