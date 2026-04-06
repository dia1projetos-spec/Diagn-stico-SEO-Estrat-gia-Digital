"use client";
import { useState } from "react";

export default function ConteudoPage() {
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const analyze = async () => {
    if (!text || !keyword) return;
    setLoading(true);
    setResult("");

    try {
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const keywordCount = (text.toLowerCase().match(new RegExp(keyword.toLowerCase(), "g")) || []).length;
      const keywordDensity = wordCount > 0 ? ((keywordCount / wordCount) * 100).toFixed(2) : "0";

      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Você é um especialista em SEO de conteúdo. Analise o texto abaixo e dê feedback detalhado e prático. Escreva em português brasileiro.

Palavra-chave alvo: ${keyword}
Total de palavras: ${wordCount}
Ocorrências da palavra-chave: ${keywordCount} (densidade: ${keywordDensity}%)

TEXTO:
${text.slice(0, 3000)}

Analise e responda:
1. AVALIAÇÃO GERAL (nota de 0-10 e justificativa)
2. USO DA PALAVRA-CHAVE: Está bem distribuída? Falta ou excede?
3. ESTRUTURA: O texto tem início, meio e fim claros?
4. LEGIBILIDADE: Parágrafos longos demais? Falta subtítulos?
5. 3 MELHORIAS ESPECÍFICAS com exemplos práticos
6. SUGESTÃO DE TÍTULO SEO otimizado para "${keyword}"`
          }]
        })
      });

      const aiData = await aiRes.json();
      setResult(aiData.content?.[0]?.text || "Análise não disponível.");
    } catch (e) {
      setResult("Erro ao analisar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const kwCount = keyword ? (text.toLowerCase().match(new RegExp(keyword.toLowerCase(), "g")) || []).length : 0;

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Análise de Conteúdo</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Cole seu texto e a IA analisa o SEO do conteúdo com sugestões de melhoria.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>Palavra-chave Principal</label>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Ex: tênis masculino"
            style={{ width: "100%", maxWidth: "400px", padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Conteúdo da Página</label>
            <div style={{ display: "flex", gap: "16px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{wordCount} palavras</span>
              {keyword && <span style={{ fontSize: "12px", color: kwCount > 0 ? "var(--accent)" : "var(--text-muted)" }}>"{keyword}" aparece {kwCount}x</span>}
            </div>
          </div>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Cole aqui o texto da sua página, artigo ou descrição de produto..."
            rows={12}
            style={{ width: "100%", padding: "14px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text-primary)", fontSize: "14px", outline: "none", resize: "vertical", lineHeight: "1.6", fontFamily: "var(--font-dm)" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        </div>
      </div>

      <button onClick={analyze} disabled={loading || !text || !keyword}
        style={{ padding: "13px 28px", background: loading ? "var(--text-muted)" : "var(--accent)", border: "none", borderRadius: "12px", color: "#0a0a0f", fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", marginBottom: "32px" }}>
        {loading ? "Analisando conteúdo..." : "Analisar com IA"}
      </button>

      {result && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--accent)44", borderRadius: "16px", padding: "28px", maxWidth: "800px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }} />
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", color: "var(--accent)" }}>Análise de Conteúdo SEO</h3>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-line" }}>{result}</p>
        </div>
      )}
    </div>
  );
}
