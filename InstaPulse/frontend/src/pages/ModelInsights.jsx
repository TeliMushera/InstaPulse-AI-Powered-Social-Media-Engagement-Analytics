// ModelInsights.jsx — Model Insights page
import { useEffect, useState } from "react";
import { api } from "../api";

export function ModelInsights() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.modelInfo().then(setInfo).catch(console.error);
  }, []);

  if (!info) return <div className="loading">Loading model info…</div>;

  const maxFI = Math.max(...Object.values(info.feature_importance));

  const metricItems = [
    { label: "Model Type",       val: "Random Forest" },
    { label: "Estimators",       val: info.n_estimators },
    { label: "Test Accuracy",    val: `${(info.accuracy * 100).toFixed(1)}%` },
    { label: "Target",           val: "3-class" },
    { label: "Low Threshold",    val: `≤ ${info.low_threshold}%` },
    { label: "High Threshold",   val: `> ${info.high_threshold}%` },
  ];

  // Manually embed the known classification report results from the Python run
  const classReport = [
    { cls: "Low",    precision: 0.77, recall: 0.66, f1: 0.71, support: 332 },
    { cls: "Medium", precision: 0.58, recall: 0.60, f1: 0.59, support: 329 },
    { cls: "High",   precision: 0.80, recall: 0.88, f1: 0.84, support: 339 },
  ];

  return (
    <>
      <div className="page-title">Model Insights</div>
      <div className="page-subtitle">
        Random Forest Classifier trained on the social media engagement dataset
      </div>

      {/* Metric chips */}
      <div className="metrics-grid">
        {metricItems.map((m) => (
          <div key={m.label} className="metric-chip">
            <div className="mc-val">{m.val}</div>
            <div className="mc-lbl">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        {/* Feature Importance */}
        <div className="chart-card">
          <h3>Feature Importance</h3>
          <div style={{ marginTop: 8 }}>
            {Object.entries(info.feature_importance).map(([k, v]) => (
              <div key={k} className="fi-row">
                <span className="fi-name">{k.replace(/_/g, " ")}</span>
                <div className="fi-bar-bg">
                  <div
                    className="fi-bar-fill"
                    style={{ width: `${(v / maxFI) * 100}%` }}
                  />
                </div>
                <span className="fi-val">{(v * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Classification report */}
        <div className="chart-card">
          <h3>Classification Report (Test Set)</h3>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Class</th><th>Precision</th><th>Recall</th><th>F1-Score</th><th>Support</th>
                </tr>
              </thead>
              <tbody>
                {classReport.map((r) => (
                  <tr key={r.cls}>
                    <td>
                      <span className={`badge badge-${r.cls.toLowerCase()}`}>{r.cls}</span>
                    </td>
                    <td>{r.precision.toFixed(2)}</td>
                    <td>{r.recall.toFixed(2)}</td>
                    <td style={{ color: "#60a5fa", fontWeight: 600 }}>{r.f1.toFixed(2)}</td>
                    <td style={{ color: "#64748b" }}>{r.support}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ color: "#94a3b8" }}>Accuracy</td>
                  <td colSpan={3} style={{ color: "#4ade80", fontWeight: 700 }}>
                    {(info.accuracy * 100).toFixed(1)}%
                  </td>
                  <td style={{ color: "#64748b" }}>1000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Model explanation */}
      <div className="chart-card">
        <h3>About the Model</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
              Algorithm
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8 }}>
              <strong style={{ color: "#f1f5f9" }}>Random Forest Classifier</strong> — an ensemble of 100 decision trees.
              Each tree is trained on a random subset of the data. The final prediction is
              determined by majority vote across all trees.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
              Target Variable
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8 }}>
              The <strong style={{ color: "#f1f5f9" }}>Engagement Rate</strong> is binned into 3 classes:
              &nbsp;<span className="badge badge-low">Low</span> (≤ {info.low_threshold}%),
              &nbsp;<span className="badge badge-medium">Medium</span> ({info.low_threshold}–{info.high_threshold}%),
              &nbsp;<span className="badge badge-high">High</span> (&gt; {info.high_threshold}%).
            </p>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
              Training Details
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8 }}>
              Dataset: 5,000 posts. Train/Test split: 80/20 (4,000 training / 1,000 testing).
              Stratified split ensures balanced class distribution in both sets.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
              Top Insights
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8 }}>
              <strong style={{ color: "#f1f5f9" }}>Follower Count</strong> is the single strongest predictor (23.6%),
              followed by <strong style={{ color: "#f1f5f9" }}>Platform</strong> (15.6%) and
              <strong style={{ color: "#f1f5f9" }}> Content Length</strong> (12.7%).
            </p>
          </div>
        </div>
      </div>

      {/* Features list */}
      <div className="chart-card" style={{ marginTop: 20 }}>
        <h3>Input Features Used ({info.features.length})</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {info.features.map((f) => (
            <span key={f} style={{
              background: "#1a2030", border: "1px solid #1e2535",
              borderRadius: 6, padding: "4px 10px",
              fontSize: 12, color: "#94a3b8"
            }}>{f.replace(/_/g, " ")}</span>
          ))}
        </div>
      </div>
    </>
  );
}
