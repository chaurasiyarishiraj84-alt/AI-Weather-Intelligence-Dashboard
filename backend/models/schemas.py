from datetime import datetime

from pydantic import BaseModel, Field


class WeatherCreate(BaseModel):
    location: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="City or location name"
    )

    temperature: float = Field(
        ...,
        description="Temperature in Celsius"
    )

    weather_condition: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    humidity: int = Field(
        ...,
        ge=0,
        le=100,
        description="Humidity percentage"
    )


class WeatherUpdate(BaseModel):
    location: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    temperature: float | None = None

    weather_condition: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    humidity: int | None = Field(
        default=None,
        ge=0,
        le=100
    )


class WeatherResponse(BaseModel):
    id: int
    location: str
    temperature: float
    weather_condition: str
    humidity: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }