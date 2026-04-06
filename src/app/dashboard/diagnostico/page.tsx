"use client";
import { useState } from "react";

interface SEOIssue {
  type: "error" | "warning" | "success";
  category: string;
  message: string;
  fix: string;
}

interface SEOResult {
  score: number;
  issues: SEOIssue[];
  aiAnalysis: string;
  url: string;
}

export default function DiagnosticoPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState("");

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Fetch page via allorigins proxy
      setStep("Buscando a página...");
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const html = data.contents || "";

      setStep("Analisando SEO técnico...");
      const issues: SEOIssue[] = [];

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Title
      const title = doc.querySelector("title")?.textContent || "";
      if (!title) issues.push({ type: "error", category: "Title", message: "Tag <title> ausente", fix: "Adicione uma tag <title> com 50-60 caracteres descrevendo a página." });
      else if (title.length < 30) issues.push({ type: "warning", category: "Title", message: `Title muito curto (${title.length} chars): "${title}"`, fix: "Aumente o title para entre 50-60 caracteres com a palavra-chave principal." });
      else if (title.length > 60) issues.push({ type: "warning", category: "Title", message: `Title muito longo (${title.length} chars)`, fix: "Reduza o title para no máximo 60 caracteres para não ser cortado no Google." });
      else issues.push({ type: "success", category: "Title", message: `Title OK: "${title}"`, fix: "" });

      // Meta description
      const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "";
      if (!desc) issues.push({ type: "error", category: "Meta Description", message: "Meta description ausente", fix: "Adicione uma meta description com 120-160 caracteres resumindo o conteúdo da página." });
      else if (desc.length < 80) issues.push({ type: "warning", category: "Meta Description", message: `Meta description curta (${desc.length} chars)`, fix: "Aumente a meta description para 120-160 caracteres." });
      else if (desc.length > 160) issues.push({ type: "warning", category: "Meta Description", message: `Meta description longa (${desc.length} chars)`, fix: "Reduza para 160 caracteres para não ser cortada nos resultados." });
      else issues.push({ type: "success", category: "Meta Description", message: `Meta description OK (${desc.length} chars)`, fix: "" });

      // H1
      const h1s = doc.querySelectorAll("h1");
      if (h1s.length === 0) issues.push({ type: "error", category: "H1", message: "Nenhum H1 encontrado", fix: "Adicione exatamente um H1 com a palavra-chave principal da página." });
      else if (h1s.length > 1) issues.push({ type: "warning", category: "H1", message: `${h1s.length} H1s encontrados (ideal: apenas 1)`, fix: "Mantenha apenas um H1 por página. Os outros podem ser H2 ou H3." });
      else issues.push({ type: "success", category: "H1", message: `H1 OK: "${h1s[0].textContent?.slice(0, 60)}"`, fix: "" });

      // H2
      const h2s = doc.querySelectorAll("h2");
      if (h2s.length === 0) issues.push({ type: "warning", category: "H2", message: "Nenhum H2 encontrado", fix: "Use H2s para estruturar o conteúdo em seções. Ajuda o Google a entender a hierarquia." });
      else issues.push({ type: "success", category: "H2", message: `${h2s.length} H2(s) encontrados`, fix: "" });

      // Images without alt
      const imgs = doc.querySelectorAll("img");
      const imgsWithoutAlt = Array.from(imgs).filter(img => !img.getAttribute("alt") || img.getAttribute("alt") === "");
      if (imgsWithoutAlt.length > 0) issues.push({ type: "warning", category: "Imagens", message: `${imgsWithoutAlt.length} imagem(ns) sem atributo ALT`, fix: "Adicione textos alternativos descritivos em todas as imagens. Isso ajuda no SEO e na acessibilidade." });
      else if (imgs.length > 0) issues.push({ type: "success", category: "Imagens", message: `Todas as ${imgs.length} imagens têm ALT`, fix: "" });

      // Canonical
      const canonical = doc.querySelector('link[rel="canonical"]');
      if (!canonical) issues.push({ type: "warning", category: "Canonical", message: "Tag canonical ausente", fix: "Adicione <link rel='canonical' href='URL'> para evitar conteúdo duplicado." });
      else issues.push({ type: "success", category: "Canonical", message: "Canonical configurado", fix: "" });

      // OG Tags
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      const ogDesc = doc.querySelector('meta[property="og:description"]');
      const ogImage = doc.querySelector('meta[property="og:image"]');
      if (!ogTitle || !ogDesc || !ogImage) issues.push({ type: "warning", category: "Open Graph", message: "Tags Open Graph incompletas", fix: "Adicione og:title, og:description e og:image para melhorar o compartilhamento nas redes sociais." });
      else issues.push({ type: "success", category: "Open Graph", message: "Open Graph completo", fix: "" });

      // Viewport
      const viewport = doc.querySelector('meta[name="viewport"]');
      if (!viewport) issues.push({ type: "error", category: "Mobile", message: "Meta viewport ausente — site não é responsivo", fix: "Adicione <meta name='viewport' content='width=device-width, initial-scale=1'>." });
      else issues.push({ type: "success", category: "Mobile", message: "Meta viewport configurado", fix: "" });

      // Schema
      const schema = doc.querySelector('script[type="application/ld+json"]');
      if (!schema) issues.push({ type: "warning", category: "Schema Markup", message: "Nenhum Schema.org encontrado", fix: "Adicione Schema.org (JSON-LD) para ajudar o Google a entender o conteúdo e exibir rich snippets." });
      else issues.push({ type: "success", category: "Schema Markup", message: "Schema.org encontrado", fix: "" });

      // Score
      const errors = issues.filter(i => i.type === "error").length;
      const warnings = issues.filter(i => i.type === "warning").length;
      const successes = issues.filter(i => i.type === "success").length;
      const total = issues.length;
      const score = Math.round((successes / total) * 100);

      // 2. AI Analysis
      setStep("Gerando análise com IA...");
      const issuesSummary = issues.map(i => `[${i.type.toUpperCase()}] ${i.category}: ${i.message}`).join("\n");

      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Você é um especialista em SEO. Analise os problemas encontrados neste site (${url}) e escreva um diagnóstico estratégico em português brasileiro. Seja direto e prático. Máximo 4 parágrafos curtos.

Problemas encontrados:
${issuesSummary}

Score SEO: ${score}/100

Escreva o diagnóstico estratégico:`
          }]
        })
      });

      const aiData = await aiRes.json();
      const aiAnalysis = aiData.content?.[0]?.text || "Análise não disponível.";

      setResult({ score, issues, aiAnalysis, url });
    } catch (err) {
      setError("Não foi possível analisar a URL. Verifique se o endereço está correto e tente novamente.");
    } finally {
      setLoading(false);
      setStep("");
    }
  };

  const scoreColor = result ? (result.score >= 80 ? "var(--success)" : result.score >= 50 ? "var(--warning)" : "var(--danger)") : "var(--accent)";

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>
          Diagnóstico SEO
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Cole a URL do seu site e receba uma análise técnica completa com IA.
        </p>
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://seusite.com.br"
          onKeyDown={e => e.key === "Enter" && analyze()}
          style={{
            flex: 1, minWidth: "280px", padding: "14px 18px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "12px", color: "var(--text-primary)", fontSize: "15px", outline: "none",
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <button
          onClick={analyze}
          disabled={loading || !url}
          style={{
            padding: "14px 28px", background: loading ? "var(--text-muted)" : "var(--accent)",
            border: "none", borderRadius: "12px", color: "#0a0a0f",
            fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
          }}
        >
          {loading ? step || "Analisando..." : "Analisar"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "16px", background: "#ff4d6d15", border: "1px solid #ff4d6d44", borderRadius: "12px", color: "var(--danger)", marginBottom: "24px" }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Score */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-syne)", fontSize: "72px", fontWeight: "800", color: scoreColor, lineHeight: 1 }}>
                {result.score}
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>Score SEO</div>
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: "700", marginBottom: "12px" }}>
                {result.score >= 80 ? "✅ Bom trabalho!" : result.score >= 50 ? "⚠️ Precisa melhorar" : "🚨 Atenção necessária"}
              </h2>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {[
                  { label: "Erros", count: result.issues.filter(i => i.type === "error").length, color: "var(--danger)" },
                  { label: "Avisos", count: result.issues.filter(i => i.type === "warning").length, color: "var(--warning)" },
                  { label: "OK", count: result.issues.filter(i => i.type === "success").length, color: "var(--success)" },
                ].map(s => (
                  <div key={s.label}>
                    <span style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: "800", color: s.color }}>{s.count}</span>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", marginLeft: "6px" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--accent)44", borderRadius: "16px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }} />
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", color: "var(--accent)" }}>
                Análise da IA
              </h3>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
              {result.aiAnalysis}
            </p>
          </div>

          {/* Issues list */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>
              Itens Verificados
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {result.issues.map((issue, i) => (
                <div key={i} style={{
                  padding: "14px 16px", borderRadius: "10px",
                  background: issue.type === "error" ? "#ff4d6d0a" : issue.type === "warning" ? "#f5a6230a" : "#00e5a00a",
                  border: `1px solid ${issue.type === "error" ? "#ff4d6d33" : issue.type === "warning" ? "#f5a62333" : "#00e5a033"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>
                      {issue.type === "error" ? "🔴" : issue.type === "warning" ? "🟡" : "🟢"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px",
                          background: issue.type === "error" ? "#ff4d6d22" : issue.type === "warning" ? "#f5a62322" : "#00e5a022",
                          color: issue.type === "error" ? "var(--danger)" : issue.type === "warning" ? "var(--warning)" : "var(--success)",
                        }}>
                          {issue.category}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-primary)", marginBottom: issue.fix ? "6px" : "0" }}>
                        {issue.message}
                      </p>
                      {issue.fix && (
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          💡 {issue.fix}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
