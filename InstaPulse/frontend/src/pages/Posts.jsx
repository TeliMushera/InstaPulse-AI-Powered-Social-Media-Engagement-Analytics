// Posts.jsx — Posts Explorer
import { useEffect, useState } from "react";
import { api } from "../api";

export function Posts() {
  const [filters,  setFilters]  = useState({ platforms: [], content_types: [], categories: [] });
  const [platform, setPlatform] = useState("");
  const [ct,       setCt]       = useState("");
  const [cat,      setCat]      = useState("");
  const [page,     setPage]     = useState(1);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    api.filters().then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.posts({ platform, contentType: ct, category: cat, page, pageSize: 50 })
      .then((r) => { setResult(r); setLoading(false); })
      .catch((e) => { console.error(e); setLoading(false); });
  }, [platform, ct, cat, page]);

  const reset = () => { setPlatform(""); setCt(""); setCat(""); setPage(1); };

  const perfBadge = (rate) => {
    if (rate > 4.14)  return <span className="badge badge-high">High</span>;
    if (rate > 1.36)  return <span className="badge badge-medium">Medium</span>;
    return <span className="badge badge-low">Low</span>;
  };

  const sentBadge = (s) => (
    <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>
  );

  return (
    <>
      <div className="page-title">Posts Explorer</div>
      <div className="page-subtitle">Browse all {result ? result.total.toLocaleString() : "5,000"} posts with filters</div>

      <div className="filters">
        <select value={platform} onChange={(e) => { setPlatform(e.target.value); setPage(1); }}>
          <option value="">All Platforms</option>
          {filters.platforms.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={ct} onChange={(e) => { setCt(e.target.value); setPage(1); }}>
          <option value="">All Content Types</option>
          {filters.content_types.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {filters.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={reset} style={{ background: "#1a2030", border: "1px solid #1e2535", color: "#94a3b8", padding: "8px 14px", borderRadius: 7, cursor: "pointer", fontSize: 13 }}>
          Reset
        </button>
      </div>

      {loading && <div className="loading">Loading posts…</div>}

      {result && !loading && (
        <>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
            Showing {result.data.length} of {result.total.toLocaleString()} posts
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Post ID</th><th>Platform</th><th>Content Type</th>
                  <th>Category</th><th>Likes</th><th>Comments</th>
                  <th>Shares</th><th>Views</th><th>Eng %</th>
                  <th>Sentiment</th><th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((p) => (
                  <tr key={p.Post_ID}>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{p.Post_ID}</td>
                    <td><span className={`badge badge-${p.Platform.toLowerCase()}`}>{p.Platform}</span></td>
                    <td>{p.Content_Type}</td>
                    <td>{p.Category}</td>
                    <td>{p.Likes.toLocaleString()}</td>
                    <td>{p.Comments.toLocaleString()}</td>
                    <td>{p.Shares.toLocaleString()}</td>
                    <td>{p.Views.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: p.Engagement_Rate > 4.14 ? "#4ade80" : p.Engagement_Rate > 1.36 ? "#fbbf24" : "#f87171" }}>
                      {p.Engagement_Rate}%
                    </td>
                    <td>{sentBadge(p.Sentiment)}</td>
                    <td>{perfBadge(p.Engagement_Rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              &laquo; Prev
            </button>
            <span>Page {page} of {Math.ceil(result.total / 50)}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 50 >= result.total}
            >
              Next &raquo;
            </button>
          </div>
        </>
      )}
    </>
  );
}
