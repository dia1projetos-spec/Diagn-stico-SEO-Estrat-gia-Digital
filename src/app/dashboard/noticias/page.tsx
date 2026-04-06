"use client";
import { useState, useEffect } from "react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceColor: string;
}

const FEEDS = [
  { name: "Google Search Central", url: "https://developers.google.com/search/blog/rss.xml", color: "#4285F4" },
  { name: "Search Engine Journal", url: "https://www.searchenginejournal.com/feed/", color: "#FF6B35" },
  { name: "Search Engine Land", url: "https://searchengineland.com/feed", color: "#00C49A" },
  { name: "Moz Blog", url: "https://moz.com/blog/feed", color: "#5B4FE9" },
];

export default function NoticiasPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const allNews: NewsItem[] = [];

    await Promise.allSettled(
      FEEDS.map(async (feed) => {
        try {
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`);
          const data = await res.json();
          const xml = data.contents || "";
          const parser = new DOMParser();
          const doc = parser.parseFromString(xml, "text/xml");
          const items = Array.from(doc.querySelectorAll("item")).slice(0, 5);
          items.forEach(item => {
            allNews.push({
              title: item.querySelector("title")?.textContent || "",
              link: item.querySelector("link")?.textContent || "",
              pubDate: item.querySelector("pubDate")?.textContent || "",
              source: feed.name,
              sourceColor: feed.color,
            });
          });
        } catch (e) {}
      })
    );

    // Sort by date
    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    setNews(allNews);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return dateStr; }
  };

  const sources = ["Todos", ...FEEDS.map(f => f.name)];
  const filtered = filter === "Todos" ? news : news.filter(n => n.source === filter);

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Notícias SEO</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Últimas atualizações do mercado, direto das melhores fontes.</p>
      </div>

      {/* Source filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
        {sources.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: "7px 16px", borderRadius: "20px", border: "1px solid", borderColor: filter === s ? "var(--accent)" : "var(--border)", background: filter === s ? "var(--accent-dim)" : "transparent", color: filter === s ? "var(--accent)" : "var(--text-secondary)", fontSize: "13px", cursor: "pointer", fontWeight: filter === s ? "700" : "400", transition: "all 0.15s" }}>
            {s}
          </button>
        ))}
        <button onClick={fetchNews} style={{ padding: "7px 16px", borderRadius: "20px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", marginLeft: "auto" }}>
          ↻ Atualizar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)" }}>
          <p style={{ fontFamily: "var(--font-syne)", fontSize: "18px", marginBottom: "8px" }}>Buscando notícias...</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Consultando {FEEDS.length} fontes</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Nenhuma notícia encontrada.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px 24px", transition: "all 0.2s", display: "flex", alignItems: "flex-start", gap: "16px" }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = item.sourceColor; (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}>
                <div style={{ width: "4px", borderRadius: "2px", background: item.sourceColor, alignSelf: "stretch", flexShrink: 0, minHeight: "40px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", background: item.sourceColor + "22", color: item.sourceColor }}>
                      {item.source}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{formatDate(item.pubDate)}</span>
                  </div>
                  <p style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: "500", lineHeight: "1.5" }}>{item.title}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0, marginTop: "4px" }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
