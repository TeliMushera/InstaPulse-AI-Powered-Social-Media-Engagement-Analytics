"""
preprocessing.py
Shared utilities for loading and preprocessing the dataset.
"""
import os
import pandas as pd

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "social_media_engagement.csv")


def load_raw() -> pd.DataFrame:
    """Load the raw CSV dataset."""
    return pd.read_csv(DATA_PATH)


def load_clean() -> pd.DataFrame:
    """Load dataset with basic type fixes."""
    df = load_raw()
    df["Has_Media"]   = df["Has_Media"].astype(bool)
    df["Is_Verified"] = df["Is_Verified"].astype(bool)
    return df
