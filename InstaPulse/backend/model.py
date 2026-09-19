"""
model.py
Load the saved model and expose a predict function.
"""
import os
import joblib
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model_data.pkl")

_cache = None


def _load():
    global _cache
    if _cache is None:
        _cache = joblib.load(MODEL_PATH)
    return _cache


def predict(input_dict: dict) -> dict:
    """
    Make a prediction given a dict with these keys:
        Platform, Content_Type, Category, Follower_Count,
        Hashtag_Count, Content_Length, Hour_of_Day, Day_of_Week,
        Sentiment, Influencer_Tier, Has_Media, Is_Verified
    Returns predicted label, probabilities, and feature importances.
    """
    data      = _load()
    model     = data["model"]
    encoders  = data["encoders"]
    label_map = data["label_map"]
    feat_cols = data["feature_cols"]

    # Encode categorical inputs
    cat_cols = ["Platform", "Content_Type", "Category",
                "Day_of_Week", "Sentiment", "Influencer_Tier"]

    row = {}
    for col in feat_cols:
        val = input_dict[col]
        if col in cat_cols:
            row[col] = int(encoders[col].transform([val])[0])
        elif col in ("Has_Media", "Is_Verified"):
            row[col] = int(bool(val))
        else:
            row[col] = int(val)

    import pandas as pd
    X = pd.DataFrame([row])[feat_cols]

    pred_int  = int(model.predict(X)[0])
    proba     = model.predict_proba(X)[0].tolist()
    pred_label = label_map[pred_int]

    return {
        "label":       pred_label,
        "probabilities": {
            "Low":    round(proba[0], 3),
            "Medium": round(proba[1], 3),
            "High":   round(proba[2], 3),
        },
        "confidence": round(max(proba), 3),
    }


def get_model_info() -> dict:
    data = _load()
    return {
        "model_type":    "Random Forest Classifier",
        "n_estimators":  100,
        "accuracy":      round(data["accuracy"], 4),
        "target":        "Engagement Performance (Low / Medium / High)",
        "features":      data["feature_cols"],
        "feature_importance": {
            k: round(v, 4) for k, v in sorted(
                data["feature_importance"].items(), key=lambda x: -x[1]
            )
        },
        "low_threshold":  round(data["low_thr"], 2),
        "high_threshold": round(data["high_thr"], 2),
    }
