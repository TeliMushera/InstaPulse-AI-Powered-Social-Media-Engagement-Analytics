"""
analytics.py
Compute all analytics summaries from the dataset.
"""
try:
    from .preprocessing import load_clean
except ImportError:
    from preprocessing import load_clean


def get_summary():
    df = load_clean()
    return {
        "total_posts":       int(len(df)),
        "avg_engagement":    round(float(df["Engagement_Rate"].mean()), 2),
        "avg_likes":         round(float(df["Likes"].mean()), 0),
        "avg_comments":      round(float(df["Comments"].mean()), 0),
        "avg_shares":        round(float(df["Shares"].mean()), 0),
        "avg_views":         round(float(df["Views"].mean()), 0),
        "avg_saves":         round(float(df["Saves"].mean()), 0),
    }


def get_platform_analysis():
    df = load_clean()
    grp = df.groupby("Platform").agg(
        avg_engagement=("Engagement_Rate", "mean"),
        avg_likes=("Likes", "mean"),
        avg_comments=("Comments", "mean"),
        avg_shares=("Shares", "mean"),
        post_count=("Post_ID", "count"),
    ).reset_index().round(2)
    return grp.to_dict(orient="records")


def get_content_type_analysis():
    df = load_clean()
    grp = df.groupby("Content_Type").agg(
        avg_engagement=("Engagement_Rate", "mean"),
        avg_likes=("Likes", "mean"),
        post_count=("Post_ID", "count"),
    ).reset_index().sort_values("avg_engagement", ascending=False).round(2)
    return grp.to_dict(orient="records")


def get_category_analysis():
    df = load_clean()
    grp = df.groupby("Category").agg(
        avg_engagement=("Engagement_Rate", "mean"),
        avg_likes=("Likes", "mean"),
        post_count=("Post_ID", "count"),
    ).reset_index().sort_values("avg_engagement", ascending=False).round(2)
    return grp.to_dict(orient="records")


def get_time_analysis():
    df = load_clean()
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    by_day = (
        df.groupby("Day_of_Week")["Engagement_Rate"]
        .mean()
        .reindex(day_order)
        .round(2)
        .reset_index()
        .rename(columns={"Engagement_Rate": "avg_engagement"})
    )
    by_hour = (
        df.groupby("Hour_of_Day")["Engagement_Rate"]
        .mean()
        .round(2)
        .reset_index()
        .rename(columns={"Engagement_Rate": "avg_engagement"})
    )
    return {
        "by_day":  by_day.to_dict(orient="records"),
        "by_hour": by_hour.to_dict(orient="records"),
    }


def get_top_posts(n: int = 10):
    df = load_clean()
    cols = ["Post_ID", "Platform", "Content_Type", "Category",
            "Likes", "Comments", "Shares", "Views", "Engagement_Rate"]
    top = df.nlargest(n, "Engagement_Rate")[cols].round(2)
    return top.to_dict(orient="records")


def get_posts(platform=None, content_type=None, category=None, page=1, page_size=50):
    df = load_clean()
    if platform:
        df = df[df["Platform"] == platform]
    if content_type:
        df = df[df["Content_Type"] == content_type]
    if category:
        df = df[df["Category"] == category]

    total = len(df)
    start = (page - 1) * page_size
    end   = start + page_size
    slice_ = df.iloc[start:end]

    cols = ["Post_ID", "Timestamp", "Platform", "Content_Type", "Category",
            "Likes", "Comments", "Shares", "Views", "Saves",
            "Follower_Count", "Engagement_Rate", "Sentiment", "Influencer_Tier",
            "Has_Media", "Is_Verified"]
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "data": slice_[cols].to_dict(orient="records"),
    }


def get_filter_options():
    df = load_clean()
    return {
        "platforms":     sorted(df["Platform"].unique().tolist()),
        "content_types": sorted(df["Content_Type"].unique().tolist()),
        "categories":    sorted(df["Category"].unique().tolist()),
        "sentiments":    sorted(df["Sentiment"].unique().tolist()),
        "influencer_tiers": sorted(df["Influencer_Tier"].unique().tolist()),
        "days":          ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    }


def get_sentiment_analysis():
    df = load_clean()
    grp = df.groupby("Sentiment").agg(
        avg_engagement=("Engagement_Rate", "mean"),
        post_count=("Post_ID", "count"),
    ).reset_index().round(2)
    return grp.to_dict(orient="records")
