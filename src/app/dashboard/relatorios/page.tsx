"use client";
import { useState } from "react";

export default function RelatoriosPage() {
  const [url, setUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");

  const generateReport = async () => {
    if (!url || !siteName) return;
    setLoading(true);

    try {
      setStep("Analisando o site...");
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const html = data.contents || "";
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const title = doc.querySelector("title")?.textContent || "Não encontrado";
      const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "Não encontrado";
      const h1 = doc.querySelector("h1")?.textContent || "Não encontrado";
      const h2s = Array.from(doc.querySelectorAll("h2")).slice(0, 5).map(h => h.textContent?.trim()).filter(Boolean);
      const imgs = doc.querySelectorAll("img").length;
      const imgsNoAlt = Array.from(doc.querySelectorAll("img")).filter(i => !i.getAttribute("alt")).length;
      const hasCanonical = !!doc.querySelector('link[rel="canonical"]');
      const hasViewport = !!doc.querySelector('meta[name="viewport"]');
      const hasSchema = !!doc.querySelector('script[type="application/ld+json"]');
      const hasOG = !!doc.querySelector('meta[property="og:title"]');

      setStep("Gerando análise com IA...");
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [{
            role: "user",
            content: `Gere um relatório SEO profissional e executivo para o site "${siteName}" (${url}). Escreva em português brasileiro, de forma clara e profissional, adequado para apresentar a um cliente.

Dados coletados:
- Title: ${title}
- Meta Description: ${desc}
- H1: ${h1}
- H2s: ${h2s.join(", ") || "Nenhum"}
- Imagens: ${imgs} total, ${imgsNoAlt} sem ALT
- Canonical: ${hasCanonical ? "Sim" : "Não"}
- Viewport: ${hasViewport ? "Sim" : "Não"}
- Schema: ${hasSchema ? "Sim" : "Não"}
- Open Graph: ${hasOG ? "Sim" : "Não"}

Estruture o relatório com:
## Resumo Executivo
## Pontos Positivos
## Problemas Críticos
## Recomendações Prioritárias (numeradas, do mais para o menos urgente)
## Próximos Passos`
          }]
        })
      });

      const aiData = await aiRes.json();
      const reportText = aiData.content?.[0]?.text || "";

      setStep("Gerando PDF...");

      // Generate HTML for PDF
      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 3px solid #00e5a0; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0a0a0f; }
            .logo span { color: #00e5a0; }
            h1 { font-size: 28px; color: #0a0a0f; margin: 10px 0 5px; }
            .subtitle { color: #666; font-size: 14px; }
            .date { color: #999; font-size: 13px; margin-top: 8px; }
            h2 { color: #0a0a0f; font-size: 18px; margin-top: 30px; border-left: 4px solid #00e5a0; padding-left: 12px; }
            p { line-height: 1.7; color: #333; font-size: 14px; }
            .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
            .data-item { background: #f5f5f5; padding: 12px; border-radius: 8px; }
            .data-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
            .data-value { font-size: 14px; color: #1a1a2e; font-weight: 600; margin-top: 4px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">SEO<span>Estratégia</span></div>
            <h1>Relatório SEO — ${siteName}</h1>
            <div class="subtitle">${url}</div>
            <div class="date">Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</div>
          </div>
          <div class="data-grid">
            <div class="data-item"><div class="data-label">Title</div><div class="data-value">${title.slice(0, 60)}</div></div>
            <div class="data-item"><div class="data-label">H1</div><div class="data-value">${h1.slice(0, 60)}</div></div>
            <div class="data-item"><div class="data-label">Imagens sem ALT</div><div class="data-value">${imgsNoAlt} de ${imgs}</div></div>
            <div class="data-item"><div class="data-label">Schema Markup</div><div class="data-value">${hasSchema ? "✅ Presente" : "❌ Ausente"}</div></div>
            <div class="data-item"><div class="data-label">Open Graph</div><div class="data-value">${hasOG ? "✅ Configurado" : "❌ Ausente"}</div></div>
            <div class="data-item"><div class="data-label">Responsivo</div><div class="data-value">${hasViewport ? "✅ Sim" : "❌ Não"}</div></div>
          </div>
          ${reportText.replace(/## (.*)/g, '<h2>$1</h2>').replace(/\n\n/g, '<br><br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
          <div class="footer">Relatório gerado pelo SEOEstratégia • ${new Date().getFullYear()}</div>
        </body>
        </html>
      `;

      // Open print dialog
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(reportHTML);
        win.document.close();
        win.onload = () => win.print();
      }
    } catch (e) {
      alert("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setLoading(false);
      setStep("");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Relatórios PDF</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Gere relatórios profissionais prontos para apresentar ao cliente.</p>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", maxWidth: "580px", marginBottom: "32px" }}>
        <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Gerar Novo Relatório</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "7px" }}>Nome do Site / Cliente</label>
            <input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Ex: Loja da Maria"
              style={{ width: "100%", padding: "12px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "7px" }}>URL do Site</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://seusite.com.br"
              style={{ width: "100%", padding: "12px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>
          <button onClick={generateReport} disabled={loading || !url || !siteName}
            style={{ padding: "13px", background: loading ? "var(--text-muted)" : "var(--accent)", border: "none", borderRadius: "10px", color: "#0a0a0f", fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", marginTop: "4px" }}>
            {loading ? step || "Gerando..." : "📄 Gerar Relatório PDF"}
          </button>
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", maxWidth: "580px" }}>
        <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>O que inclui o relatório</h3>
        {[
          "Resumo executivo com diagnóstico geral",
          "Dados técnicos coletados da página",
          "Pontos positivos identificados",
          "Problemas críticos encontrados",
          "Recomendações priorizadas por urgência",
          "Próximos passos claros e acionáveis",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < 5 ? "1px solid var(--border)44" : "none" }}>
            <span style={{ color: "var(--accent)", fontSize: "14px" }}>✓</span>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
