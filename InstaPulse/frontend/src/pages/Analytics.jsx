// Analytics.jsx
import { useEffect, useState } from "react";
import { api } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

function useFetch(fn) {
  const [data, setData] = useState(null);
  useEffect(() => { fn().then(setData).catch(console.error); }, []);
  return data;
}

export function Analytics() {
  const platform  = useFetch(api.platform);
  const ct        = useFetch(api.contentType);
  const category  = useFetch(api.category);
  const time      = useFetch(api.time);
  const sentiment = useFetch(api.sentiment);
  const topPosts  = useFetch(() => api.topPosts(10));

  const tipStyle = { background: "#1e2535", border: "1px solid #334155", borderRadius: 6 };
  const axTick   = { fill: "#94a3b8", fontSize: 11 };

  return (
    <>
      <div className="page-title">Analytics</div>
      <div className="page-subtitle">Deep-dive analysis across platforms, content types, categories and time</div>

      <div className="charts-grid">
        {/* Platform */}
        <div className="chart-card">
          <h3>Engagement Rate by Platform</h3>
          {platform && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={platform}>
                <XAxis dataKey="Platform" tick={axTick} />
                <YAxis tick={axTick} />
                <Tooltip contentStyle={tipStyle} itemStyle={{ color: "#94a3b8" }} labelStyle={{ color: "#f1f5f9" }} />
                <Bar dataKey="avg_engagement" name="Avg Engagement %" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform likes */}
        <div className="chart-card">
          <h3>Average Likes by Platform</h3>
          {platform && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={platform}>
                <XAxis dataKey="Platform" tick={axTick} />
                <YAxis tick={axTick} />
                <Tooltip contentStyle={tipStyle} itemStyle={{ color: "#94a3b8" }} labelStyle={{ color: "#f1f5f9" }} />
                <Bar dataKey="avg_likes" name="Avg Likes" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category */}
        <div className="chart-card">
          <h3>Engagement by Category</h3>
          {category && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={category} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={axTick} />
                <YAxis dataKey="Category" type="category" tick={axTick} width={90} />
                <Tooltip contentStyle={tipStyle} itemStyle={{ color: "#94a3b8" }} labelStyle={{ color: "#f1f5f9" }} />
                <Bar dataKey="avg_engagement" name="Avg Engagement %" fill="#f59e0b" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sentiment */}
        <div className="chart-card">
          <h3>Engagement by Sentiment</h3>
          {sentiment && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sentiment}>
                <XAxis dataKey="Sentiment" tick={axTick} />
                <YAxis tick={axTick} />
                <Tooltip contentStyle={tipStyle} itemStyle={{ color: "#94a3b8" }} labelStyle={{ color: "#f1f5f9" }} />
                <Bar dataKey="avg_engagement" name="Avg Engagement %" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Day of Week */}
        <div className="chart-card">
          <h3>Engagement by Day of Week</h3>
          {time && (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={time.by_day}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="Day_of_Week" tick={axTick} />
                <YAxis tick={axTick} />
                <Tooltip contentStyle={tipStyle} itemStyle={{ color: "#94a3b8" }} labelStyle={{ color: "#f1f5f9" }} />
                <Line type="monotone" dataKey="avg_engagement" name="Avg Engagement %" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: "#8b5cf6" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Hour of Day */}
        <div className="chart-card">
          <h3>Engagement by Hour of Day</h3>
          {time && (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={time.by_hour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="Hour_of_Day" tick={axTick} label={{ value: "Hour", position: "insideBottom", fill: "#64748b", dy: 10 }} />
                <YAxis tick={axTick} />
                <Tooltip contentStyle={tipStyle} itemStyle={{ color: "#94a3b8" }} labelStyle={{ color: "#f1f5f9" }} />
                <Line type="monotone" dataKey="avg_engagement" name="Avg Engagement %" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top posts table */}
      <div className="chart-card">
        <h3>Top 10 Posts by Engagement Rate</h3>
        {topPosts && (
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Post ID</th><th>Platform</th><th>Content Type</th>
                  <th>Category</th><th>Likes</th><th>Comments</th>
                  <th>Shares</th><th>Views</th><th>Engagement %</th>
                </tr>
              </thead>
              <tbody>
                {topPosts.map((p) => (
                  <tr key={p.Post_ID}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.Post_ID}</td>
                    <td><span className={`badge badge-${p.Platform.toLowerCase()}`}>{p.Platform}</span></td>
                    <td>{p.Content_Type}</td>
                    <td>{p.Category}</td>
                    <td>{p.Likes.toLocaleString()}</td>
                    <td>{p.Comments.toLocaleString()}</td>
                    <td>{p.Shares.toLocaleString()}</td>
                    <td>{p.Views.toLocaleString()}</td>
                    <td style={{ color: "#4ade80", fontWeight: 600 }}>{p.Engagement_Rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
