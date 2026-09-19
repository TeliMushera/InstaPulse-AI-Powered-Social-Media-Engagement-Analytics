# =============================================================================
# TeliMushera_InstaPulse.py
# InstaPulse — AI-Powered Social Media Engagement Analytics
# IBM SkillBuild Final Project
# Author: Teli Mushera
# =============================================================================

# ── 1. Import Libraries ──────────────────────────────────────────────────────
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix
)
import joblib
import warnings
warnings.filterwarnings("ignore")

print("=" * 60)
print("  InstaPulse — Social Media Engagement Analytics")
print("=" * 60)

# ── 2. Load Dataset ───────────────────────────────────────────────────────────
df = pd.read_csv("InstaPulse/data/social_media_engagement.csv")
print(f"\n[1] Dataset loaded: {df.shape[0]} rows × {df.shape[1]} columns")

# ── 3. Inspect Dataset ────────────────────────────────────────────────────────
print("\n[2] Column names and data types:")
print(df.dtypes)
print("\nFirst 3 rows:")
print(df.head(3).to_string())
print("\nMissing values per column:")
print(df.isnull().sum())

# ── 4. Preprocess Data ────────────────────────────────────────────────────────
print("\n[3] Preprocessing...")

# Drop Post_ID and Timestamp (not useful for ML)
df_ml = df.drop(columns=["Post_ID", "Timestamp"])

# Convert bool columns to int
df_ml["Has_Media"]    = df_ml["Has_Media"].astype(int)
df_ml["Is_Verified"]  = df_ml["Is_Verified"].astype(int)

# Create the target: Engagement Performance Category
# Low (0)  = bottom 33%   |  Medium (1) = middle 33%   |  High (2) = top 33%
low_thr, high_thr = df_ml["Engagement_Rate"].quantile([0.33, 0.66])
def label_engagement(val):
    if val <= low_thr:
        return 0   # Low
    elif val <= high_thr:
        return 1   # Medium
    else:
        return 2   # High

df_ml["Performance_Label"] = df_ml["Engagement_Rate"].apply(label_engagement)
label_map = {0: "Low", 1: "Medium", 2: "High"}
print(f"   Thresholds: Low <= {low_thr:.2f}%  |  High > {high_thr:.2f}%")
print("   Performance distribution:")
print(df_ml["Performance_Label"].value_counts().rename(label_map))

# Encode categorical features
categorical_cols = ["Platform", "Content_Type", "Category",
                    "Day_of_Week", "Sentiment", "Influencer_Tier"]
encoders = {}
for col in categorical_cols:
    le = LabelEncoder()
    df_ml[col] = le.fit_transform(df_ml[col])
    encoders[col] = le

print("   Categorical columns encoded.")

# ── 5. Basic Analysis ─────────────────────────────────────────────────────────
print("\n[4] Basic Analysis")
print(f"   Total posts       : {len(df):,}")
print(f"   Avg Engagement    : {df['Engagement_Rate'].mean():.2f}%")
print(f"   Avg Likes         : {df['Likes'].mean():,.0f}")
print(f"   Avg Comments      : {df['Comments'].mean():,.0f}")
print(f"   Avg Shares        : {df['Shares'].mean():,.0f}")
print(f"   Avg Views         : {df['Views'].mean():,.0f}")

print("\n   Performance by Platform:")
print(df.groupby("Platform")["Engagement_Rate"].mean().sort_values(ascending=False).round(2))

print("\n   Performance by Content Type (Top 5):")
print(df.groupby("Content_Type")["Engagement_Rate"].mean().sort_values(ascending=False).head(5).round(2))

print("\n   Performance by Category (Top 5):")
print(df.groupby("Category")["Engagement_Rate"].mean().sort_values(ascending=False).head(5).round(2))

print("\n   Performance by Day of Week:")
print(df.groupby("Day_of_Week")["Engagement_Rate"].mean().sort_values(ascending=False).round(2))

print("\n   Top 5 Posts by Engagement Rate:")
top5 = df.nlargest(5, "Engagement_Rate")[["Post_ID", "Platform", "Content_Type", "Engagement_Rate"]]
print(top5.to_string(index=False))

# ── 6. Visualizations ─────────────────────────────────────────────────────────
print("\n[5] Creating visualizations...")
sns.set_style("darkgrid")
plt.rcParams["figure.facecolor"] = "#1a1a2e"
plt.rcParams["axes.facecolor"]   = "#16213e"
plt.rcParams["text.color"]       = "white"
plt.rcParams["axes.labelcolor"]  = "white"
plt.rcParams["xtick.color"]      = "white"
plt.rcParams["ytick.color"]      = "white"

fig, axes = plt.subplots(2, 3, figsize=(18, 10))
fig.suptitle("InstaPulse — Social Media Analytics", fontsize=16,
             color="white", fontweight="bold")

# Plot 1 – Avg Engagement by Platform
plat_eng = df.groupby("Platform")["Engagement_Rate"].mean().sort_values(ascending=False)
axes[0, 0].bar(plat_eng.index, plat_eng.values, color="#3b82f6")
axes[0, 0].set_title("Avg Engagement Rate by Platform", color="white")
axes[0, 0].set_ylabel("Engagement Rate (%)")
axes[0, 0].tick_params(axis="x", rotation=30)

# Plot 2 – Avg Engagement by Content Type (top 8)
ct_eng = df.groupby("Content_Type")["Engagement_Rate"].mean().sort_values(ascending=False).head(8)
axes[0, 1].barh(ct_eng.index, ct_eng.values, color="#8b5cf6")
axes[0, 1].set_title("Avg Engagement by Content Type", color="white")
axes[0, 1].set_xlabel("Engagement Rate (%)")

# Plot 3 – Posts per Platform (pie)
plat_counts = df["Platform"].value_counts()
axes[0, 2].pie(plat_counts.values, labels=plat_counts.index, autopct="%1.1f%%",
               colors=["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4"],
               textprops={"color": "white"})
axes[0, 2].set_title("Post Distribution by Platform", color="white")

# Plot 4 – Engagement by Day of Week
day_order = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
day_eng = df.groupby("Day_of_Week")["Engagement_Rate"].mean().reindex(day_order)
axes[1, 0].plot(day_eng.index, day_eng.values, marker="o", color="#10b981", linewidth=2)
axes[1, 0].set_title("Avg Engagement by Day of Week", color="white")
axes[1, 0].set_ylabel("Engagement Rate (%)")
axes[1, 0].tick_params(axis="x", rotation=30)

# Plot 5 – Engagement by Sentiment
sent_eng = df.groupby("Sentiment")["Engagement_Rate"].mean()
colors_s = {"Positive": "#10b981", "Neutral": "#f59e0b", "Negative": "#ef4444"}
axes[1, 1].bar(sent_eng.index, sent_eng.values,
               color=[colors_s.get(s, "#3b82f6") for s in sent_eng.index])
axes[1, 1].set_title("Avg Engagement by Sentiment", color="white")
axes[1, 1].set_ylabel("Engagement Rate (%)")

# Plot 6 – Correlation Heatmap
num_cols = ["Likes","Comments","Shares","Views","Saves",
            "Follower_Count","Engagement_Rate","Hashtag_Count","Content_Length"]
corr = df[num_cols].corr()
sns.heatmap(corr, ax=axes[1, 2], cmap="coolwarm", annot=True, fmt=".1f",
            annot_kws={"size": 6}, linewidths=0.5)
axes[1, 2].set_title("Correlation Heatmap", color="white")

plt.tight_layout()
plt.savefig("InstaPulse/analytics_plots.png", dpi=120, bbox_inches="tight",
            facecolor="#1a1a2e")
plt.show()
print("   Saved: InstaPulse/analytics_plots.png")

# ── 7. Prepare ML Data ────────────────────────────────────────────────────────
print("\n[6] Preparing ML data...")
feature_cols = [
    "Platform", "Content_Type", "Category", "Follower_Count",
    "Hashtag_Count", "Content_Length", "Hour_of_Day", "Day_of_Week",
    "Sentiment", "Influencer_Tier", "Has_Media", "Is_Verified"
]
X = df_ml[feature_cols]
y = df_ml["Performance_Label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"   Training samples : {len(X_train)}")
print(f"   Testing samples  : {len(X_test)}")

# ── 8. Train Model ────────────────────────────────────────────────────────────
print("\n[7] Training Random Forest Classifier...")
model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)
print("   Model trained.")

# ── 9. Evaluate Model ─────────────────────────────────────────────────────────
print("\n[8] Evaluating model...")
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"   Accuracy: {acc:.4f}  ({acc*100:.1f}%)")
print("\n   Classification Report:")
print(classification_report(y_test, y_pred, target_names=["Low","Medium","High"]))

# Feature Importance
fi = pd.Series(model.feature_importances_, index=feature_cols).sort_values(ascending=False)
print("   Top Feature Importances:")
print(fi.round(4))

# Confusion matrix plot
fig2, ax2 = plt.subplots(figsize=(6, 5))
fig2.patch.set_facecolor("#1a1a2e")
ax2.set_facecolor("#16213e")
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax2,
            xticklabels=["Low","Medium","High"],
            yticklabels=["Low","Medium","High"])
ax2.set_title("Confusion Matrix", color="white")
ax2.set_xlabel("Predicted", color="white")
ax2.set_ylabel("Actual", color="white")
ax2.tick_params(colors="white")
plt.tight_layout()
plt.savefig("InstaPulse/confusion_matrix.png", dpi=120, bbox_inches="tight",
            facecolor="#1a1a2e")
plt.show()
print("   Saved: InstaPulse/confusion_matrix.png")

# ── 10. Save Model & Metadata ─────────────────────────────────────────────────
print("\n[9] Saving model...")
model_data = {
    "model": model,
    "feature_cols": feature_cols,
    "encoders": encoders,
    "label_map": label_map,
    "low_thr": low_thr,
    "high_thr": high_thr,
    "accuracy": acc,
    "feature_importance": fi.to_dict()
}
joblib.dump(model_data, "InstaPulse/backend/model_data.pkl")
print("   Saved: InstaPulse/backend/model_data.pkl")

# ── 10. Make a Sample Prediction ──────────────────────────────────────────────
print("\n[10] Sample Prediction:")
sample = pd.DataFrame([{
    "Platform":       encoders["Platform"].transform(["Instagram"])[0],
    "Content_Type":   encoders["Content_Type"].transform(["Reel"])[0],
    "Category":       encoders["Category"].transform(["Entertainment"])[0],
    "Follower_Count": 150000,
    "Hashtag_Count":  12,
    "Content_Length": 300,
    "Hour_of_Day":    18,
    "Day_of_Week":    encoders["Day_of_Week"].transform(["Friday"])[0],
    "Sentiment":      encoders["Sentiment"].transform(["Positive"])[0],
    "Influencer_Tier":encoders["Influencer_Tier"].transform(["Macro"])[0],
    "Has_Media":      1,
    "Is_Verified":    0
}])
pred_label = model.predict(sample)[0]
pred_proba = model.predict_proba(sample)[0]
print(f"   Input  : Instagram Reel | Entertainment | 150K followers | Positive")
print(f"   Result : {label_map[pred_label]} performance")
print(f"   Proba  : Low={pred_proba[0]:.2f}  Medium={pred_proba[1]:.2f}  High={pred_proba[2]:.2f}")

print("\n" + "=" * 60)
print("  All steps complete! Check InstaPulse/ for saved files.")
print("=" * 60)
