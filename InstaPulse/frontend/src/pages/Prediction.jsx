// Prediction.jsx — AI Prediction page
import { useEffect, useState } from "react";
import { api } from "../api";

const DEFAULTS = {
  Platform: "Instagram",
  Content_Type: "Reel",
  Category: "Entertainment",
  Follower_Count: 150000,
  Hashtag_Count: 12,
  Content_Length: 300,
  Hour_of_Day: 18,
  Day_of_Week: "Friday",
  Sentiment: "Positive",
  Influencer_Tier: "Macro",
  Has_Media: true,
  Is_Verified: false,
};

export function Prediction() {
  const [filters, setFilters] = useState(null);
  const [form,    setForm]    = useState(DEFAULTS);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.filters().then(setFilters).catch(console.error);
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = {
        ...form,
        Follower_Count: Number(form.Follower_Count),
        Hashtag_Count:  Number(form.Hashtag_Count),
        Content_Length: Number(form.Content_Length),
        Hour_of_Day:    Number(form.Hour_of_Day),
        Has_Media:      Boolean(form.Has_Media),
        Is_Verified:    Boolean(form.Is_Verified),
      };
      const res = await api.predict(body);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!filters) return <div className="loading">Loading…</div>;

  const barColor = (k) =>
    k === "High"   ? "#4ade80" :
    k === "Medium" ? "#fbbf24" : "#f87171";

  return (
    <>
      <div className="page-title">AI Prediction</div>
      <div className="page-subtitle">
        Enter post details below and the AI model will predict its engagement performance level.
      </div>

      <div className="chart-card" style={{ marginBottom: 24 }}>
        <h3>Post Details</h3>
        <div style={{ marginBottom: 16 }} />

        <div className="predict-grid">
          <div className="field">
            <label>Platform</label>
            <select value={form.Platform} onChange={(e) => set("Platform", e.target.value)}>
              {filters.platforms.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Content Type</label>
            <select value={form.Content_Type} onChange={(e) => set("Content_Type", e.target.value)}>
              {filters.content_types.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Category</label>
            <select value={form.Category} onChange={(e) => set("Category", e.target.value)}>
              {filters.categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Sentiment</label>
            <select value={form.Sentiment} onChange={(e) => set("Sentiment", e.target.value)}>
              {filters.sentiments.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Influencer Tier</label>
            <select value={form.Influencer_Tier} onChange={(e) => set("Influencer_Tier", e.target.value)}>
              {filters.influencer_tiers.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Day of Week</label>
            <select value={form.Day_of_Week} onChange={(e) => set("Day_of_Week", e.target.value)}>
              {filters.days.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Follower Count</label>
            <input type="number" value={form.Follower_Count} min={0} onChange={(e) => set("Follower_Count", e.target.value)} />
          </div>

          <div className="field">
            <label>Hashtag Count</label>
            <input type="number" value={form.Hashtag_Count} min={0} max={50} onChange={(e) => set("Hashtag_Count", e.target.value)} />
          </div>

          <div className="field">
            <label>Content Length (chars)</label>
            <input type="number" value={form.Content_Length} min={0} onChange={(e) => set("Content_Length", e.target.value)} />
          </div>

          <div className="field">
            <label>Hour of Day (0–23)</label>
            <input type="number" value={form.Hour_of_Day} min={0} max={23} onChange={(e) => set("Hour_of_Day", e.target.value)} />
          </div>

          <div className="field">
            <label>Has Media</label>
            <select value={String(form.Has_Media)} onChange={(e) => set("Has_Media", e.target.value === "true")}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="field">
            <label>Is Verified</label>
            <select value={String(form.Is_Verified)} onChange={(e) => set("Is_Verified", e.target.value === "true")}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        <button className="btn-predict" onClick={submit} disabled={loading}>
          {loading ? "Predicting…" : "Predict Engagement"}
        </button>

        {error && <div className="error" style={{ marginTop: 12 }}>Error: {error}</div>}
      </div>

      {result && (
        <div className="result-card">
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Predicted Performance
          </div>
          <div className={`result-label ${result.label}`}>
            {result.label === "High" ? "🟢" : result.label === "Medium" ? "🟡" : "🔴"} {result.label} Engagement
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
            Model confidence: <strong style={{ color: "#60a5fa" }}>{(result.confidence * 100).toFixed(1)}%</strong>
          </div>

          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" }}>
            Probability Breakdown
          </div>
          <div className="proba-bars">
            {Object.entries(result.probabilities).map(([k, v]) => (
              <div key={k} className="proba-row">
                <span className="proba-name">{k}</span>
                <div className="proba-bar-bg">
                  <div className="proba-bar-fill" style={{ width: `${v * 100}%`, background: barColor(k) }} />
                </div>
                <span className="proba-pct">{(v * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: "14px 16px", background: "#1a2030", borderRadius: 8, fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
            <strong style={{ color: "#f1f5f9" }}>Key factors (from model training):</strong>
            <br />
            Follower count, platform, and content length are the top three factors that drive engagement performance.
            Posting on <strong style={{ color: "#60a5fa" }}>TikTok or YouTube</strong> with
            a <strong style={{ color: "#60a5fa" }}>Positive</strong> sentiment and <strong style={{ color: "#60a5fa" }}>higher follower count</strong> significantly increases the chance of high engagement.
          </div>
        </div>
      )}
    </>
  );
}
