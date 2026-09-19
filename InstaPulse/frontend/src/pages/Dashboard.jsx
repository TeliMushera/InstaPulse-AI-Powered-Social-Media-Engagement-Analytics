// Dashboard.jsx
import { useEffect, useState } from "react";
import { api } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4"];

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

function useFetch(fn) {
  const [data, setData] = useState(null);
  const [err,  setErr]  = useState(null);
  useEffect(() => { fn().then(setData).catch(setErr); }, []);
  return [data, err];
}

export function Dashboard() {
  const [summary]  = useFetch(api.summary);
  const [platform] = useFetch(api.platform);
  const [ct]       = useFetch(api.contentType);

  if (!summary) return <div className="loading">Loading dashboard…</div>;

  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n;

  return (
    <>
      <div className="page-title">Dashboard</div>
      <div className="page-subtitle">Overview of social media post performance across all platforms</div>

      <div className="stats-grid">
        <StatCard label="Total Posts"       value={summary.total_posts.toLocaleString()} />
        <StatCard label="Avg Engagement"    value={`${summary.avg_engagement}%`} sub="Engagement Rate" />
        <StatCard label="Avg Likes"         value={fmt(summary.avg_likes)} />
        <StatCard label="Avg Comments"      value={fmt(summary.avg_comments)} />
        <StatCard label="Avg Shares"        value={fmt(summary.avg_shares)} />
        <StatCard label="Avg Views"         value={fmt(summary.avg_views)} />
        <StatCard label="Avg Saves"         value={fmt(summary.avg_saves)} />
      </div>

      <div className="charts-grid">
        {/* Platform comparison */}
        <div className="chart-card">
          <h3>Average Engagement Rate by Platform</h3>
          {platform && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={platform} margin={{ left: -10 }}>
                <XAxis dataKey="Platform" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1e2535", border: "1px solid #334155", borderRadius: 6 }}
                  labelStyle={{ color: "#f1f5f9" }}
                  itemStyle={{ color: "#94a3b8" }}
                />
                <Bar dataKey="avg_engagement" name="Avg Engagement %" radius={[4,4,0,0]}>
                  {platform.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Post count pie */}
        <div className="chart-card">
          <h3>Post Distribution by Platform</h3>
          {platform && (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={platform} dataKey="post_count" nameKey="Platform" cx="50%" cy="50%" outerRadius={85} label={({ Platform, percent }) => `${Platform} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {platform.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e2535", border: "1px solid #334155" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Content type */}
        <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
          <h3>Average Engagement by Content Type</h3>
          {ct && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ct.slice(0,10)} margin={{ left: -10 }}>
                <XAxis dataKey="Content_Type" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1e2535", border: "1px solid #334155", borderRadius: 6 }} itemStyle={{ color: "#94a3b8" }} labelStyle={{ color: "#f1f5f9" }} />
                <Bar dataKey="avg_engagement" name="Avg Engagement %" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}
