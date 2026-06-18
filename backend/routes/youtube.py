import logging
import os

from dotenv import load_dotenv

from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Query

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from pydantic import BaseModel
from pydantic import Field


# ==================================================
# Environment
# ==================================================

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# ==================================================
# Logging
# ==================================================

logger = logging.getLogger(__name__)

# ==================================================
# Router
# ==================================================

router = APIRouter(
    prefix="/youtube",
    tags=["YouTube"]
)

# ==================================================
# Response Models
# ==================================================


class VideoItem(BaseModel):
    title: str = Field(
        ...,
        description="Video title"
    )

    description: str = Field(
        ...,
        description="Video description"
    )

    channel_title: str = Field(
        ...,
        description="Channel name"
    )

    published_at: str = Field(
        ...,
        description="Video publish timestamp"
    )

    thumbnail_url: str = Field(
        ...,
        description="High resolution thumbnail"
    )

    video_id: str = Field(
        ...,
        description="YouTube video ID"
    )

    video_url: str = Field(
        ...,
        description="Watch URL"
    )

    embed_url: str = Field(
        ...,
        description="Embed URL"
    )


class YouTubeSearchResponse(BaseModel):
    location: str

    total_videos: int

    videos: list[VideoItem]


# ==================================================
# Helper Function
# ==================================================


def get_youtube_client():
    """
    Create YouTube client.
    """

    if not YOUTUBE_API_KEY:
        raise HTTPException(
            status_code=500,
            detail=(
                "YOUTUBE_API_KEY not configured. "
                "Please add it to .env"
            )
        )

    return build(
        serviceName="youtube",
        version="v3",
        developerKey=YOUTUBE_API_KEY
    )


# ==================================================
# Routes
# ==================================================


@router.get(
    "/location",
    response_model=YouTubeSearchResponse,
    summary="Search YouTube videos by location",
    description=(
        "Returns tourism, travel and location-related "
        "YouTube videos."
    )
)
def search_location_videos(
    location: str = Query(
        ...,
        min_length=2,
        max_length=100,
        description=(
            "City, landmark, destination, "
            "state or country"
        )
    )
):
    """
    Search YouTube for location-specific videos.
    """

    try:

        youtube = get_youtube_client()

        search_query = (
            f"{location} tourism OR "
            f"{location} travel OR "
            f"{location} attractions"
        )

        request = youtube.search().list(
            q=search_query,
            part="snippet",
            type="video",
            maxResults=5,
            safeSearch="moderate"
        )

        response = request.execute()

        videos = []

        for item in response.get("items", []):

            snippet = item["snippet"]

            video_id = item["id"]["videoId"]

            videos.append(
                VideoItem(
                    title=snippet.get("title"),
                    description=snippet.get(
                        "description",
                        ""
                    ),
                    channel_title=snippet.get(
                        "channelTitle",
                        ""
                    ),
                    published_at=snippet.get(
                        "publishedAt",
                        ""
                    ),
                    thumbnail_url=snippet[
                        "thumbnails"
                    ]["high"]["url"],
                    video_id=video_id,
                    video_url=(
                        "https://www.youtube.com/watch"
                        f"?v={video_id}"
                    ),
                    embed_url=(
                        "https://www.youtube.com/embed/"
                        f"{video_id}"
                    )
                )
            )

        return YouTubeSearchResponse(
            location=location,
            total_videos=len(videos),
            videos=videos
        )

    except HttpError as exc:

        logger.error(
            "YouTube API Error: %s",
            str(exc)
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "YouTube service unavailable."
            )
        )

    except Exception as exc:

        logger.exception(
            "Unexpected error: %s",
            str(exc)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to fetch YouTube videos."
            )
        )