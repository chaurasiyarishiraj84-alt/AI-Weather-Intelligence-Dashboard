from __future__ import annotations

import os
from typing import Any, Dict, List

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from db.database import get_db
from models.weather_model import WeatherRecord
from models.schemas import WeatherCreate, WeatherResponse, WeatherUpdate

load_dotenv()

router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)

API_KEY = os.getenv("WEATHER_API_KEY")
BASE_URL = "http://api.weatherapi.com/v1"

print(
    f"[DEBUG] WEATHER_API_KEY loaded: {API_KEY[:6]}..."
    if API_KEY
    else "[DEBUG] WEATHER_API_KEY is None — .env not loading!"
)

if not API_KEY:
    raise RuntimeError("WEATHER_API_KEY missing from .env")


# ─────────────────────────────────────────────
#  HELPER
# ─────────────────────────────────────────────

def _get(url: str, params: Dict) -> Dict[str, Any]:
    """Shared request handler with clean error surfacing."""
    try:
        response = requests.get(url, params=params, timeout=10)
    except requests.Timeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Weather provider timed out."
        )
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Connection error: {str(e)}"
        )

    if response.status_code != 200:
        try:
            detail = response.json().get("error", {}).get("message", response.text)
        except Exception:
            detail = response.text
        raise HTTPException(status_code=response.status_code, detail=detail)

    return response.json()


def resolve_location(location: str, preferred_country: str | None = None) -> Dict[str, Any]:
    """
    Resolve a user-entered location into an exact place using
    WeatherAPI's Search endpoint. Picks the best match instead of
    blindly trusting results[0], which can return the wrong country
    (e.g. 'Delhi' -> Ontario, Canada instead of India).

    Resolution order:
      1. Exact name match + preferred_country match (if given)
      2. Exact name match, highest population (WeatherAPI doesn't
         return population, so we fall back to first exact match)
      3. First exact name match of any country
      4. First result overall (last resort)
    """
    location = location.strip()

    try:
        response = requests.get(
            f"{BASE_URL}/search.json",
            params={"key": API_KEY, "q": location},
            timeout=10
        )
        response.raise_for_status()
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Location lookup timed out.")
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Location resolution failed: {str(e)}")

    results = response.json()

    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"Location '{location}' not found."
        )

    # If the user already disambiguated (e.g. "Delhi, India"), trust results[0] —
    # WeatherAPI's search ranks an exact "City, Country" query correctly.
    if "," in location:
        return results[0]

    name_part = location.split(",")[0].strip().lower()
    exact_matches = [r for r in results if r["name"].strip().lower() == name_part]

    if not exact_matches:
        return results[0]

    if preferred_country:
        country_match = next(
            (r for r in exact_matches if r["country"].lower() == preferred_country.lower()),
            None
        )
        if country_match:
            return country_match

    return exact_matches[0]


# ─────────────────────────────────────────────
#  LOCATION SEARCH  (for frontend autocomplete)
# ─────────────────────────────────────────────

@router.get(
    "/search",
    summary="Search/autocomplete locations (disambiguation list)",
    tags=["Live Weather"]
)
def search_locations(
    q: str = Query(..., min_length=2, max_length=100, description="Partial or full location name")
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns ALL matching locations so the frontend can show a dropdown
    like 'Delhi, India' vs 'Delhi, Ontario, Canada' and let the user
    pick the exact one — same pattern as Google Maps / Uber / Weather.com.
    """
    try:
        response = requests.get(
            f"{BASE_URL}/search.json",
            params={"key": API_KEY, "q": q.strip()},
            timeout=10
        )
        response.raise_for_status()
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="Location search timed out.")
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Location search failed: {str(e)}")

    results = response.json()

    return {
        "results": [
            {
                "name": r["name"],
                "region": r.get("region", ""),
                "country": r["country"],
                "lat": r["lat"],
                "lon": r["lon"],
                "display_name": f"{r['name']}, {r['region']}, {r['country']}"
                                 if r.get("region") else f"{r['name']}, {r['country']}"
            }
            for r in results
        ]
    }


# ─────────────────────────────────────────────
#  LIVE WEATHER  (WeatherAPI.com)
# ─────────────────────────────────────────────

@router.get(
    "/current",
    summary="Get current weather by location",
    tags=["Live Weather"]
)
@router.get(
    "/current",
    summary="Get current weather by location",
    tags=["Live Weather"]
)
def get_current_weather(
    location: str = Query(
        ...,
        min_length=2,
        max_length=100,
        description="City, zip code, landmark, or lat,lon"
    ),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:

    resolved = resolve_location(location)

    query = f"{resolved['lat']},{resolved['lon']}"

    data = _get(
        url=f"{BASE_URL}/current.json",
        params={
            "key": API_KEY,
            "q": query
        }
    )

    # ------------------------------------------------
    # AUTO SAVE SEARCH TO DATABASE
    # ------------------------------------------------

    record = WeatherRecord(
        location=data["location"]["name"],
        temperature=data["current"]["temp_c"],
        weather_condition=data["current"]["condition"]["text"],
        humidity=data["current"]["humidity"]
    )

    db.add(record)
    db.commit()

    # ------------------------------------------------
    # RESPONSE
    # ------------------------------------------------

    return {
        "location": {
            "city": data["location"]["name"],
            "region": data["location"]["region"],
            "country": data["location"]["country"],
            "lat": data["location"]["lat"],
            "lon": data["location"]["lon"]
        },
        "weather": {
            "condition": data["current"]["condition"]["text"],
            "icon": f"https:{data['current']['condition']['icon']}"
        },
        "temperature": {
            "current": data["current"]["temp_c"],
            "feels_like": data["current"]["feelslike_c"]
        },
        "humidity": data["current"]["humidity"],
        "wind_kph": data["current"]["wind_kph"],
        "pressure": data["current"]["pressure_mb"],
        "visibility_km": data["current"]["vis_km"],
        "uv_index": data["current"]["uv"]
    }

@router.get(
    "/forecast",
    summary="Get 5-day weather forecast",
    tags=["Live Weather"]
)
def get_forecast(
    location: str = Query(..., min_length=2, max_length=100,
                          description="City, zip code, landmark, or lat,lon")
) -> Dict[str, Any]:

    resolved = resolve_location(location)
    query = f"{resolved['lat']},{resolved['lon']}"

    data = _get(
        url=f"{BASE_URL}/forecast.json",
        params={"key": API_KEY, "q": query, "days": 5}
    )

    forecast = []
    for day in data["forecast"]["forecastday"]:
        forecast.append({
            "date":      day["date"],
            "avg_temp":  day["day"]["avgtemp_c"],
            "max_temp":  day["day"]["maxtemp_c"],
            "min_temp":  day["day"]["mintemp_c"],
            "condition": day["day"]["condition"]["text"],
            "icon":      f"https:{day['day']['condition']['icon']}",
            "humidity":  day["day"]["avghumidity"],
            "wind_speed": day["day"]["maxwind_kph"],
            "rain_chance": day["day"]["daily_chance_of_rain"],
            "uv_index":  day["day"]["uv"]
        })

    return {
        "location": {
            "city":    data["location"]["name"],
            "country": data["location"]["country"]
        },
        "forecast": forecast
    }


# ─────────────────────────────────────────────
#  CRUD  (SQLite via SQLAlchemy)
# ─────────────────────────────────────────────

@router.post(
    "/records",
    response_model=WeatherResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a weather record",
    tags=["CRUD"]
)
def create_weather_record(
    payload: WeatherCreate,
    db: Session = Depends(get_db)
):
    record = WeatherRecord(
        location=payload.location,
        temperature=payload.temperature,
        weather_condition=payload.weather_condition,
        humidity=payload.humidity
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get(
    "/records",
    response_model=List[WeatherResponse],
    summary="Get all saved weather records",
    tags=["CRUD"]
)
def get_all_records(db: Session = Depends(get_db)):
    return db.query(WeatherRecord).all()


@router.get(
    "/records/{record_id}",
    response_model=WeatherResponse,
    summary="Get a single weather record by ID",
    tags=["CRUD"]
)
def get_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(WeatherRecord).filter(WeatherRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found.")
    return record


@router.put(
    "/records/{record_id}",
    response_model=WeatherResponse,
    summary="Update a weather record",
    tags=["CRUD"]
)
def update_record(
    record_id: int,
    payload: WeatherUpdate,
    db: Session = Depends(get_db)
):
    record = db.query(WeatherRecord).filter(WeatherRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)
    return record


@router.delete(
    "/records/{record_id}",
    summary="Delete a weather record",
    tags=["CRUD"]
)
def delete_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(WeatherRecord).filter(WeatherRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found.")

    db.delete(record)
    db.commit()
    return {"success": True, "message": f"Record {record_id} deleted."}