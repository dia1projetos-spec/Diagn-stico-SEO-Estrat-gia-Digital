"use client";

export default function DashboardPage() {
  const cards = [
    { label: "Score SEO", value: "—", sub: "Adicione um site para analisar", color: "var(--accent)", icon: "📊" },
    { label: "Cliques (30 dias)", value: "—", sub: "Conecte o Search Console", color: "var(--info)", icon: "🖱️" },
    { label: "Impressões", value: "—", sub: "Conecte o Search Console", color: "var(--warning)", icon: "👁️" },
    { label: "Posição Média", value: "—", sub: "Conecte o Search Console", color: "var(--success)", icon: "📍" },
  ];

  const actions = [
    { label: "Fazer Diagnóstico SEO", desc: "Analise seu site agora", href: "/dashboard/diagnostico", color: "var(--accent)" },
    { label: "Conectar Search Console", desc: "Veja seus dados reais do Google", href: "/dashboard/search-console", color: "var(--info)" },
    { label: "Analisar Concorrente", desc: "Descubra como superá-lo", href: "/dashboard/concorrentes", color: "var(--warning)" },
    { label: "Ver Notícias SEO", desc: "Fique atualizado", href: "/dashboard/noticias", color: "var(--danger)" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{
          fontFamily: "var(--font-syne)",
          fontSize: "28px",
          fontWeight: "800",
          color: "var(--text-primary)",
          marginBottom: "8px",
          letterSpacing: "-0.5px",
        }}>
          Visão Geral
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Bem-vindo ao SEOEstratégia. Comece adicionando seu site.
        </p>
      </div>

      {/* Score cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "32px",
      }}>
        {cards.map((card) => (
          <div key={card.label} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "20px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "3px",
              background: card.color,
            }} />
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>{card.icon}</div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>{card.label}</p>
            <p style={{
              fontFamily: "var(--font-syne)", fontSize: "32px", fontWeight: "800",
              color: card.color, lineHeight: 1,
            }}>{card.value}</p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: "12px" }}>
        <h2 style={{
          fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700",
          color: "var(--text-primary)", marginBottom: "16px",
        }}>
          Ações Rápidas
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "12px",
        }}>
          {actions.map((action) => (
            <a key={action.label} href={action.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "18px 20px",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = action.color;
                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
              }}>
                <div>
                  <p style={{
                    fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: "700",
                    color: "var(--text-primary)", marginBottom: "4px",
                  }}>{action.label}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{action.desc}</p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={action.color} strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
