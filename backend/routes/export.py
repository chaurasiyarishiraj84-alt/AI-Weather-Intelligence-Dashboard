import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from db.database import get_db
from models.weather_model import WeatherRecord
from reportlab.platypus import SimpleDocTemplate
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

router = APIRouter(
    prefix="/export",
    tags=["Export"]
)
@router.get("/json")
def export_json(
    db: Session = Depends(get_db)
):
    records = db.query(WeatherRecord).all()

    return [
        {
            "id": record.id,
            "location": record.location,
            "temperature": record.temperature,
            "weather_condition": record.weather_condition,
            "humidity": record.humidity,
            "created_at": record.created_at
        }
        for record in records
    ]
@router.get("/csv")
def export_csv(
    db: Session = Depends(get_db)
):
    records = db.query(WeatherRecord).all()

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Location",
        "Temperature",
        "Condition",
        "Humidity",
        "Created At"
    ])

    for record in records:
        writer.writerow([
            record.id,
            record.location,
            record.temperature,
            record.weather_condition,
            record.humidity,
            record.created_at
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=weather_records.csv"
        }
    )
@router.get("/md")
def export_markdown(
    db: Session = Depends(get_db)
):
    records = db.query(WeatherRecord).all()

    markdown = "# Weather Records\n\n"

    markdown += (
        "| ID | Location | Temp | Condition | Humidity |\n"
    )

    markdown += (
        "|----|----------|------|-----------|----------|\n"
    )

    for record in records:
        markdown += (
            f"| {record.id} "
            f"| {record.location} "
            f"| {record.temperature} "
            f"| {record.weather_condition} "
            f"| {record.humidity} |\n"
        )

    return StreamingResponse(
        io.StringIO(markdown),
        media_type="text/markdown",
        headers={
            "Content-Disposition":
            "attachment; filename=weather_records.md"
        }
    )
@router.get("/pdf")
def export_pdf(
    db: Session = Depends(get_db)
):
    records = db.query(WeatherRecord).all()

    pdf_buffer = io.BytesIO()

    document = SimpleDocTemplate(
        pdf_buffer
    )

    styles = getSampleStyleSheet()

    elements = [
        Paragraph(
            "Weather Records Report",
            styles["Title"]
        )
    ]

    for record in records:

        text = (
            f"ID: {record.id}<br/>"
            f"Location: {record.location}<br/>"
            f"Temperature: {record.temperature}<br/>"
            f"Condition: {record.weather_condition}<br/>"
            f"Humidity: {record.humidity}<br/><br/>"
        )

        elements.append(
            Paragraph(
                text,
                styles["BodyText"]
            )
        )

    document.build(elements) #type: ignore

    pdf_buffer.seek(0)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=weather_records.pdf"
        }
    )
