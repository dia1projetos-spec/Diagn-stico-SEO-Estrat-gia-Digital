"use client";
import { useState } from "react";

export default function ConcorrentesPage() {
  const [url, setUrl] = useState("");
  const [myUrl, setMyUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [tecnico, setTecnico] = useState<any>(null);

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    setResult("");
    setTecnico(null);

    try {
      // Fetch competitor page
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const html = data.contents || "";

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const title = doc.querySelector("title")?.textContent || "Não encontrado";
      const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "Não encontrado";
      const h1 = doc.querySelector("h1")?.textContent || "Não encontrado";
      const h2s = Array.from(doc.querySelectorAll("h2")).map(h => h.textContent?.trim()).filter(Boolean).slice(0, 5);
      const wordCount = doc.body?.innerText?.split(/\s+/).length || 0;
      const imgs = doc.querySelectorAll("img").length;
      const links = doc.querySelectorAll("a").length;
      const hasSchema = !!doc.querySelector('script[type="application/ld+json"]');
      const hasCanonical = !!doc.querySelector('link[rel="canonical"]');

      const tecnicoData = { title, desc, h1, h2s, wordCount, imgs, links, hasSchema, hasCanonical };
      setTecnico(tecnicoData);

      // AI strategy
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Você é um especialista em SEO e estratégia digital. Analise o site concorrente abaixo e gere estratégias práticas e específicas para superá-lo. Escreva em português brasileiro, de forma direta e acionável.

Site concorrente: ${url}
${myUrl ? `Meu site: ${myUrl}` : ""}

Dados técnicos do concorrente:
- Title: ${title}
- Meta Description: ${desc}
- H1: ${h1}
- H2s: ${h2s.join(", ")}
- Schema markup: ${hasSchema ? "Sim" : "Não"}
- Link canonical: ${hasCanonical ? "Sim" : "Não"}

Com base nisso, escreva:
1. Pontos fracos do concorrente que posso explorar
2. 3 estratégias de conteúdo para superá-lo
3. 2 ações técnicas imediatas
4. Uma oportunidade de palavra-chave que ele pode estar perdendo`
          }]
        })
      });

      const aiData = await aiRes.json();
      setResult(aiData.content?.[0]?.text || "Análise não disponível.");
    } catch (e) {
      setResult("Erro ao analisar o concorrente. Verifique a URL e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Análise de Concorrentes</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Cole a URL do concorrente e receba estratégias para superá-lo.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "600px", marginBottom: "32px" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>URL do Concorrente</label>
          <input
            type="url" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://concorrente.com.br"
            style={{ width: "100%", padding: "13px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text-primary)", fontSize: "15px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>Meu Site (opcional — para comparação)</label>
          <input
            type="url" value={myUrl} onChange={e => setMyUrl(e.target.value)}
            placeholder="https://meusite.com.br"
            style={{ width: "100%", padding: "13px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text-primary)", fontSize: "15px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        </div>
        <button
          onClick={analyze} disabled={loading || !url}
          style={{ padding: "13px", background: loading ? "var(--text-muted)" : "var(--accent)", border: "none", borderRadius: "12px", color: "#0a0a0f", fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Analisando concorrente..." : "Analisar Concorrente"}
        </button>
      </div>

      {tecnico && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Technical data */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Dados Técnicos do Concorrente</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
              {[
                { label: "Title", value: tecnico.title },
                { label: "Meta Description", value: tecnico.desc },
                { label: "H1", value: tecnico.h1 },
                { label: "H2s", value: tecnico.h2s.join(" • ") || "Nenhum" },
                { label: "Schema Markup", value: tecnico.hasSchema ? "✅ Presente" : "❌ Ausente" },
                { label: "Canonical", value: tecnico.hasCanonical ? "✅ Presente" : "❌ Ausente" },
              ].map(item => (
                <div key={item.label} style={{ padding: "14px", background: "var(--bg-elevated)", borderRadius: "10px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{item.label}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.5" }}>{item.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Strategies */}
          {result && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--accent)44", borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }} />
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", color: "var(--accent)" }}>
                  Estratégias para Superar o Concorrente
                </h3>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-line" }}>
                {result}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
