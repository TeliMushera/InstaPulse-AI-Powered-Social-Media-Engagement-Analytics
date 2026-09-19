// App.jsx
import { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Posts }     from "./pages/Posts";
import { Prediction } from "./pages/Prediction";
import { ModelInsights } from "./pages/ModelInsights";
import "./index.css";

const NAV = [
  { id: "dashboard",  label: "Dashboard",      icon: "📊" },
  { id: "analytics",  label: "Analytics",      icon: "📈" },
  { id: "posts",      label: "Posts Explorer", icon: "🗂️"  },
  { id: "prediction", label: "AI Prediction",  icon: "🤖" },
  { id: "model",      label: "Model Insights", icon: "🔬" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");

  const Page =
    page === "dashboard"  ? Dashboard  :
    page === "analytics"  ? Analytics  :
    page === "posts"      ? Posts      :
    page === "prediction" ? Prediction :
    ModelInsights;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>InstaPulse</h1>
          <span>AI Analytics</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <div
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e2535" }}>
          <div style={{ fontSize: 11, color: "#475569" }}>IBM SkillBuild</div>
          <div style={{ fontSize: 11, color: "#475569" }}>Final Project</div>
        </div>
      </aside>

      <main className="main">
        <Page />
      </main>
    </div>
  );
}
