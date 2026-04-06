"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, orderBy, query, Timestamp } from "firebase/firestore";

interface RankEntry { date: string; keyword: string; position: number; id?: string; }

export default function MonitoramentoPage() {
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [keyword, setKeyword] = useState("");
  const [position, setPosition] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const siteId = auth.currentUser?.uid || "default";

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const q = query(collection(db, "sites", siteId, "rankings"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as RankEntry[];
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!keyword || !position) return;
    setSaving(true);
    try {
      const entry = { keyword, position: parseInt(position), date: new Date().toLocaleDateString("pt-BR"), createdAt: Timestamp.now() };
      await addDoc(collection(db, "sites", siteId, "rankings"), entry);
      setEntries(prev => [entry, ...prev]);
      setKeyword("");
      setPosition("");
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  // Group by keyword for chart data
  const byKeyword = entries.reduce((acc, e) => {
    if (!acc[e.keyword]) acc[e.keyword] = [];
    acc[e.keyword].push(e);
    return acc;
  }, {} as Record<string, RankEntry[]>);

  const colors = ["var(--accent)", "var(--info)", "var(--warning)", "var(--danger)", "#a855f7"];

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Monitoramento de Posições</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Acompanhe a evolução do ranking das suas palavras-chave ao longo do tempo.</p>
      </div>

      {/* Add entry */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", marginBottom: "24px", maxWidth: "600px" }}>
        <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>Registrar Posição Hoje</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Palavra-chave"
            style={{ flex: 2, minWidth: "180px", padding: "11px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          <input type="number" value={position} onChange={e => setPosition(e.target.value)} placeholder="Posição (ex: 7)"
            style={{ flex: 1, minWidth: "100px", padding: "11px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          <button onClick={addEntry} disabled={saving || !keyword || !position}
            style={{ padding: "11px 20px", background: "var(--accent)", border: "none", borderRadius: "10px", color: "#0a0a0f", fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}>
            {saving ? "..." : "+ Registrar"}
          </button>
        </div>
      </div>

      {/* Keywords summary */}
      {Object.keys(byKeyword).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {Object.entries(byKeyword).slice(0, 5).map(([kw, data], i) => {
            const latest = data[0];
            const previous = data[1];
            const diff = previous ? previous.position - latest.position : 0;
            return (
              <div key={kw} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: colors[i % colors.length] }} />
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kw}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ fontFamily: "var(--font-syne)", fontSize: "40px", fontWeight: "800", color: colors[i % colors.length], lineHeight: 1 }}>#{latest.position}</span>
                  {diff !== 0 && (
                    <span style={{ fontSize: "14px", color: diff > 0 ? "var(--success)" : "var(--danger)", fontWeight: "700" }}>
                      {diff > 0 ? `▲ +${diff}` : `▼ ${diff}`}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>Último registro: {latest.date}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* History table */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
        <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Histórico de Posições</h3>
        {loading ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px" }}>Carregando...</p>
        ) : entries.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px" }}>Nenhum registro ainda. Adicione sua primeira posição acima.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Data", "Palavra-chave", "Posição"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-muted)", fontWeight: "600", fontSize: "11px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.id || i} style={{ borderBottom: "1px solid var(--border)44" }}>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)", fontSize: "13px" }}>{e.date}</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-primary)", fontWeight: "500" }}>{e.keyword}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "6px", fontWeight: "700", fontSize: "13px", background: e.position <= 3 ? "#00e5a022" : e.position <= 10 ? "#f5a62322" : "#ff4d6d22", color: e.position <= 3 ? "var(--success)" : e.position <= 10 ? "var(--warning)" : "var(--danger)" }}>
                      #{e.position}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
