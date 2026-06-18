from __future__ import annotations

import requests

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(
    prefix="/ai",
    tags=["AI Travel Assistant"]
)


class ChatRequest(BaseModel):
    location: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    question: str = Field(
        ...,
        min_length=2,
        max_length=1000
    )


class ChatResponse(BaseModel):
    location: str
    answer: str


SYSTEM_PROMPT = """
You are TravelMate AI, an expert travel consultant.

Your purpose is to provide detailed travel recommendations.

You can help with:

- Tourist attractions
- Historical landmarks
- Restaurants
- Local food
- Hotels
- Transportation
- Travel budgets
- Weather-related travel advice
- Family travel
- Solo travel
- Shopping
- Safety tips
- Travel itineraries

Rules:

1. Answer only travel-related questions.

2. If a question is not travel related reply exactly:

I am a travel and tourism assistant and can only help with travel-related questions.

3. Focus only on the location provided.

4. Never invent attractions or hotels.

5. Use headings.

6. Use bullet points.

7. Include practical recommendations.

8. Mention:
   - Top attractions
   - Local food
   - Transportation
   - Safety tips

9. For itinerary requests, create day-wise plans.

10. Keep answers professional and helpful.
"""


def generate_travel_response(
    location: str,
    question: str
) -> str:

    prompt = f"""
{SYSTEM_PROMPT}

Location: {location}

User Question:
{question}

Provide:

1. Direct answer
2. Recommended attractions
3. Food recommendations
4. Transportation tips
5. Safety advice

Format using headings and bullet points.
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "qwen2.5-coder:3b",
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 700
            }
        },
        timeout=180
    )

    print("STATUS:", response.status_code)
    print("BODY:", response.text[:500])

    response.raise_for_status()

    data = response.json()

    return data.get(
        "response",
        "No response generated."
    )


@router.get("/health")
def health_check():

    return {
        "success": True,
        "service": "AI Travel Assistant",
        "provider": "Ollama",
        "model": "qwen2.5-coder:3b"
    }


@router.post(
    "/chat",
    response_model=ChatResponse
)
def chat(request: ChatRequest):

    try:

        answer = generate_travel_response(
            location=request.location,
            question=request.question
        )

        return ChatResponse(
            location=request.location,
            answer=answer
        )

    except requests.Timeout:
        raise HTTPException(
            status_code=504,
            detail="AI model response timed out."
        )

    except requests.RequestException as e:
        raise HTTPException(
            status_code=502,
            detail=f"Ollama connection error: {str(e)}"
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )