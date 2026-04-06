"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  keywords: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  pages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
}

export default function SearchConsolePage() {
  const [connected, setConnected] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const [data, setData] = useState<SearchConsoleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [period, setPeriod] = useState("28");

  const handleConnect = async () => {
    if (!siteUrl || !accessToken) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "sites", auth.currentUser!.uid), {
        url: siteUrl,
        ownerId: auth.currentUser!.uid,
        searchConsoleConnected: true,
        searchConsoleToken: accessToken,
        updatedAt: new Date(),
      }, { merge: true });
      setConnected(true);
      await fetchData();
    } catch (e) {
      alert("Erro ao salvar. Verifique suas credenciais.");
    } finally {
      setSaving(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - parseInt(period) * 86400000).toISOString().split("T")[0];

      // Keywords
      const kwRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, dimensions: ["query"], rowLimit: 10 }),
      });
      const kwData = await kwRes.json();

      // Pages
      const pgRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, dimensions: ["page"], rowLimit: 10 }),
      });
      const pgData = await pgRes.json();

      const rows = kwData.rows || [];
      const pgRows = pgData.rows || [];

      const totals = rows.reduce((acc: any, r: any) => ({
        clicks: acc.clicks + r.clicks,
        impressions: acc.impressions + r.impressions,
      }), { clicks: 0, impressions: 0 });

      setData({
        clicks: totals.clicks,
        impressions: totals.impressions,
        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
        position: rows.length > 0 ? rows.reduce((a: number, r: any) => a + r.position, 0) / rows.length : 0,
        keywords: rows.map((r: any) => ({
          query: r.keys[0], clicks: r.clicks, impressions: r.impressions,
          ctr: r.ctr * 100, position: r.position,
        })),
        pages: pgRows.map((r: any) => ({
          page: r.keys[0], clicks: r.clicks, impressions: r.impressions,
          ctr: r.ctr * 100, position: r.position,
        })),
      });
    } catch (e) {
      alert("Erro ao buscar dados. Verifique o token e a URL do site.");
    } finally {
      setLoading(false);
    }
  };

  const card = (label: string, value: string, sub: string, color: string) => (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: color }} />
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>{label}</p>
      <p style={{ fontFamily: "var(--font-syne)", fontSize: "36px", fontWeight: "800", color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>{sub}</p>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Search Console</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Conecte sua conta e veja os dados reais do Google.</p>
      </div>

      {!connected ? (
        <div style={{ maxWidth: "560px" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px" }}>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Conectar Search Console</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "24px", lineHeight: "1.6" }}>
              Para obter o Access Token, acesse o <a href="https://developers.google.com/oauthplayground" target="_blank" style={{ color: "var(--accent)" }}>OAuth Playground do Google</a>, autorize a API do Search Console e copie o Access Token gerado.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>URL do Site (como está no Search Console)</label>
                <input
                  type="text" value={siteUrl} onChange={e => setSiteUrl(e.target.value)}
                  placeholder="https://seusite.com.br/"
                  style={{ width: "100%", padding: "12px 16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>Access Token</label>
                <input
                  type="password" value={accessToken} onChange={e => setAccessToken(e.target.value)}
                  placeholder="ya29.xxxxx..."
                  style={{ width: "100%", padding: "12px 16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>
              <button
                onClick={handleConnect} disabled={saving || !siteUrl || !accessToken}
                style={{ padding: "13px", background: "var(--accent)", border: "none", borderRadius: "10px", color: "#0a0a0f", fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
              >
                {saving ? "Conectando..." : "Conectar"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Period selector */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {[["7", "7 dias"], ["28", "28 dias"], ["90", "90 dias"]].map(([val, label]) => (
              <button key={val} onClick={() => { setPeriod(val); fetchData(); }}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid", borderColor: period === val ? "var(--accent)" : "var(--border)", background: period === val ? "var(--accent-dim)" : "transparent", color: period === val ? "var(--accent)" : "var(--text-secondary)", fontSize: "13px", cursor: "pointer", fontWeight: period === val ? "700" : "400" }}>
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>Carregando dados...</div>
          ) : data ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {card("Cliques", data.clicks.toLocaleString("pt-BR"), `últimos ${period} dias`, "var(--accent)")}
                {card("Impressões", data.impressions.toLocaleString("pt-BR"), `últimos ${period} dias`, "var(--info)")}
                {card("CTR Médio", `${data.ctr.toFixed(1)}%`, "taxa de cliques", "var(--warning)")}
                {card("Posição Média", data.position.toFixed(1), "no Google", "var(--success)")}
              </div>

              {/* Keywords table */}
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Top Palavras-chave</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Palavra-chave", "Cliques", "Impressões", "CTR", "Posição"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-muted)", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.keywords.map((kw, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border)66" }}>
                          <td style={{ padding: "10px 12px", color: "var(--text-primary)", fontWeight: "500" }}>{kw.query}</td>
                          <td style={{ padding: "10px 12px", color: "var(--accent)" }}>{kw.clicks}</td>
                          <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{kw.impressions.toLocaleString()}</td>
                          <td style={{ padding: "10px 12px", color: "var(--warning)" }}>{kw.ctr.toFixed(1)}%</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "6px", background: kw.position <= 3 ? "#00e5a022" : kw.position <= 10 ? "#f5a62322" : "#ff4d6d22", color: kw.position <= 3 ? "var(--success)" : kw.position <= 10 ? "var(--warning)" : "var(--danger)", fontWeight: "700" }}>
                              #{kw.position.toFixed(0)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pages table */}
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Top Páginas</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Página", "Cliques", "Impressões", "CTR", "Posição"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-muted)", fontWeight: "600", fontSize: "11px", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.pages.map((pg, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border)66" }}>
                          <td style={{ padding: "10px 12px", color: "var(--text-primary)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <a href={pg.page} target="_blank" style={{ color: "var(--accent)", textDecoration: "none" }}>{pg.page}</a>
                          </td>
                          <td style={{ padding: "10px 12px", color: "var(--accent)" }}>{pg.clicks}</td>
                          <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{pg.impressions.toLocaleString()}</td>
                          <td style={{ padding: "10px 12px", color: "var(--warning)" }}>{pg.ctr.toFixed(1)}%</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "6px", background: pg.position <= 3 ? "#00e5a022" : pg.position <= 10 ? "#f5a62322" : "#ff4d6d22", color: pg.position <= 3 ? "var(--success)" : pg.position <= 10 ? "var(--warning)" : "var(--danger)", fontWeight: "700" }}>
                              #{pg.position.toFixed(0)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
