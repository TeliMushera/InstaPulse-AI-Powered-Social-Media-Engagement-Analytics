"""
main.py  —  InstaPulse FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sys, os

# Allow imports from parent directory when running directly
sys.path.insert(0, os.path.dirname(__file__))

# Use relative imports when run as a package, direct when run standalone
try:
    from .analytics import (
        get_summary, get_platform_analysis, get_content_type_analysis,
        get_category_analysis, get_time_analysis, get_top_posts,
        get_posts, get_filter_options, get_sentiment_analysis,
    )
    from .model import predict, get_model_info
except ImportError:
    from analytics import (
        get_summary, get_platform_analysis, get_content_type_analysis,
        get_category_analysis, get_time_analysis, get_top_posts,
        get_posts, get_filter_options, get_sentiment_analysis,
    )
    from model import predict, get_model_info

app = FastAPI(title="InstaPulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health ──────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "app": "InstaPulse API"}


# ─── Dashboard ───────────────────────────────────────────────────────────────
@app.get("/api/summary")
def summary():
    return get_summary()


@app.get("/api/platform")
def platform():
    return get_platform_analysis()


@app.get("/api/content-type")
def content_type():
    return get_content_type_analysis()


@app.get("/api/category")
def category():
    return get_category_analysis()


@app.get("/api/time")
def time_analysis():
    return get_time_analysis()


@app.get("/api/top-posts")
def top_posts(n: int = 10):
    return get_top_posts(n)


@app.get("/api/sentiment")
def sentiment():
    return get_sentiment_analysis()


# ─── Posts Explorer ──────────────────────────────────────────────────────────
@app.get("/api/posts")
def posts(
    platform:     Optional[str] = Query(None),
    content_type: Optional[str] = Query(None),
    category:     Optional[str] = Query(None),
    page:         int = Query(1, ge=1),
    page_size:    int = Query(50, ge=1, le=200),
):
    return get_posts(platform, content_type, category, page, page_size)


@app.get("/api/filters")
def filters():
    return get_filter_options()


# ─── AI Prediction ───────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    Platform:        str
    Content_Type:    str
    Category:        str
    Follower_Count:  int
    Hashtag_Count:   int
    Content_Length:  int
    Hour_of_Day:     int
    Day_of_Week:     str
    Sentiment:       str
    Influencer_Tier: str
    Has_Media:       bool
    Is_Verified:     bool


@app.post("/api/predict")
def make_prediction(req: PredictRequest):
    result = predict(req.model_dump())
    return result


# ─── Model Info ──────────────────────────────────────────────────────────────
@app.get("/api/model-info")
def model_info():
    return get_model_info()
