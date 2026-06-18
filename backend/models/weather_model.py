from datetime import datetime

from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String

from db.database import Base


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    location = Column(
        String(100),
        nullable=False,
        index=True
    )

    temperature = Column(
        Float,
        nullable=False
    )

    weather_condition = Column(
        String(100),
        nullable=False
    )

    humidity = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )