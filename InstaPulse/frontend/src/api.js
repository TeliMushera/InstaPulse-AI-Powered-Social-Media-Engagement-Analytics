// api.js  — central API client
const BASE = "http://localhost:8000";

export async function fetchJSON(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  summary:      () => fetchJSON("/api/summary"),
  platform:     () => fetchJSON("/api/platform"),
  contentType:  () => fetchJSON("/api/content-type"),
  category:     () => fetchJSON("/api/category"),
  time:         () => fetchJSON("/api/time"),
  topPosts:     (n = 10) => fetchJSON(`/api/top-posts?n=${n}`),
  sentiment:    () => fetchJSON("/api/sentiment"),
  filters:      () => fetchJSON("/api/filters"),
  posts:        (params) => {
    const q = new URLSearchParams();
    if (params.platform)    q.set("platform",     params.platform);
    if (params.contentType) q.set("content_type", params.contentType);
    if (params.category)    q.set("category",     params.category);
    q.set("page",      params.page      || 1);
    q.set("page_size", params.pageSize  || 50);
    return fetchJSON(`/api/posts?${q}`);
  },
  modelInfo:    () => fetchJSON("/api/model-info"),
  predict:      (body) =>
    fetch(`${BASE}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => {
      if (!r.ok) throw new Error(`API error ${r.status}`);
      return r.json();
    }),
};
