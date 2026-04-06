"use client";
import { useState } from "react";

export default function AdsPage() {
  const [url, setUrl] = useState("");
  const [visits, setVisits] = useState("");
  const [sales, setSales] = useState("");
  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const analyze = async () => {
    if (!url || !product) return;
    setLoading(true);
    setResult("");

    try {
      // Fetch page
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      const data = await res.json();
      const html = data.contents || "";

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const title = doc.querySelector("title")?.textContent || "";
      const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "";
      const h1 = doc.querySelector("h1")?.textContent || "";
      const hasCheckout = html.toLowerCase().includes("comprar") || html.toLowerCase().includes("adicionar ao carrinho") || html.toLowerCase().includes("buy") || html.toLowerCase().includes("checkout");
      const hasImages = doc.querySelectorAll("img").length > 0;
      const pageSpeed = Math.random() > 0.5; // Simulated — real would use PageSpeed API

      const visitCount = parseInt(visits) || 0;
      const salesCount = parseInt(sales) || 0;
      const conversionRate = visitCount > 0 ? (salesCount / visitCount) * 100 : 0;

      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Você é um especialista em Google Ads e conversão. Analise esta página de produto e diga se vale a pena investir em tráfego pago agora. Seja direto, prático e escreva em português brasileiro.

Produto: ${product}
URL: ${url}
Visitas: ${visitCount}
Vendas: ${salesCount}
Taxa de conversão: ${conversionRate.toFixed(1)}%

Dados técnicos da página:
- Title: ${title}
- Meta Description: ${desc}  
- H1: ${h1}
- Botão de compra visível: ${hasCheckout ? "Sim" : "Não identificado"}
- Imagens: ${hasImages ? "Sim" : "Não"}

Responda com:
1. VEREDICTO: Vale ou não vale Ads agora? Por quê?
2. Se NÃO vale: Liste exatamente o que precisa corrigir antes
3. Se VALE: Sugira 3 palavras-chave para a campanha e o tipo de campanha recomendado
4. Estimativa de potencial de retorno`
          }]
        })
      });

      const aiData = await aiRes.json();
      setResult(aiData.content?.[0]?.text || "Análise não disponível.");
    } catch (e) {
      setResult("Erro ao analisar. Verifique a URL e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Recomendações de Ads</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>A IA analisa seu produto e diz se vale investir em tráfego pago agora.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "660px", marginBottom: "24px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>Nome do Produto</label>
          <input value={product} onChange={e => setProduct(e.target.value)} placeholder="Ex: Tênis Nike Air Max"
            style={{ width: "100%", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>URL da Página do Produto</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://seusite.com/produto"
            style={{ width: "100%", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>Visitas nos últimos 30 dias</label>
          <input type="number" value={visits} onChange={e => setVisits(e.target.value)} placeholder="Ex: 150"
            style={{ width: "100%", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>Vendas nos últimos 30 dias</label>
          <input type="number" value={sales} onChange={e => setSales(e.target.value)} placeholder="Ex: 3"
            style={{ width: "100%", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
        </div>
      </div>

      <button onClick={analyze} disabled={loading || !url || !product}
        style={{ padding: "13px 28px", background: loading ? "var(--text-muted)" : "var(--accent)", border: "none", borderRadius: "12px", color: "#0a0a0f", fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", marginBottom: "32px" }}>
        {loading ? "Analisando..." : "Analisar Potencial de Ads"}
      </button>

      {result && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--accent)44", borderRadius: "16px", padding: "28px", maxWidth: "760px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }} />
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", color: "var(--accent)" }}>Análise de Potencial — {product}</h3>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-line" }}>{result}</p>
        </div>
      )}
    </div>
  );
}
