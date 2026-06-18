from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging

from db.database import Base, engine

from routes.weather import router as weather_router
from routes.export import router as export_router
from routes.maps import router as maps_router
from routes.youtube import router as youtube_router
from routes.ai import router as ai_router

# --------------------------------------------------
# Logging Configuration
# --------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)

# --------------------------------------------------
# Create Database Tables
# --------------------------------------------------
Base.metadata.create_all(bind=engine)

# --------------------------------------------------
# FastAPI Application
# --------------------------------------------------
app = FastAPI(
    title="AI Powered Weather System API",
    description="Industry-grade Weather, Maps, YouTube & Export API",
    version="1.0.0"
)

# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Request Logging Middleware
# --------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time

    logger.info(
        f"{request.method} {request.url.path} "
        f"- {response.status_code} "
        f"- {process_time:.3f}s"
    )

    response.headers["X-Process-Time"] = str(process_time)

    return response

# --------------------------------------------------
# Global Error Handler
# --------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):
    logger.error(f"Unhandled error: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal Server Error",
            "detail": str(exc)
        }
    )

# --------------------------------------------------
# Routers
# --------------------------------------------------
app.include_router(weather_router)
app.include_router(export_router)
app.include_router(maps_router)
app.include_router(youtube_router)
app.include_router(ai_router)

# --------------------------------------------------
# Health Endpoints
# --------------------------------------------------
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "success",
        "message": "AI Weather System Backend Running 🚀"
    }

@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok"
    }