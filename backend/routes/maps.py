from urllib.parse import quote_plus

from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Query

from pydantic import BaseModel
from pydantic import Field


# ── THIS is what main.py imports ──────────────
# from routes.maps import router as maps_router
router = APIRouter(
    prefix="/maps",
    tags=["Maps"]
)


# ─────────────────────────────────────────────
#  Response Model
# ─────────────────────────────────────────────

class MapLocationResponse(BaseModel):
    location: str = Field(
        ...,
        description="Original user-provided location"
    )
    encoded_location: str = Field(
        ...,
        description="URL-safe encoded location"
    )
    google_maps_url: str = Field(
        ...,
        description="Direct Google Maps URL"
    )
    google_maps_embed_url: str = Field(
        ...,
        description="Google Maps embed URL for iframe"
    )


# ─────────────────────────────────────────────
#  Route
# ─────────────────────────────────────────────

@router.get(
    "/location",
    response_model=MapLocationResponse,
    summary="Generate Google Maps URLs for a location"
)
def get_location_map(
    location: str = Query(
        ...,
        min_length=2,
        max_length=200,
        description="City, landmark, ZIP code, address, or lat,lon"
    )
):
    location = location.strip()

    if not location:
        raise HTTPException(
            status_code=400,
            detail="Location cannot be empty."
        )

    encoded_location = quote_plus(location)

    return MapLocationResponse(
        location=location,
        encoded_location=encoded_location,
        google_maps_url=(
            f"https://www.google.com/maps/search/"
            f"?api=1&query={encoded_location}"
        ),
        google_maps_embed_url=(
            f"https://www.google.com/maps?q="
            f"{encoded_location}&output=embed"
        )
    )