// js/utils.js

// ── TOAST ──────────────────────────────────────
export function toast(msg, type = 'success') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3200);
}

// ── SIDEBAR ACTIVE NAV ─────────────────────────
export function setActiveNav() {
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === path) item.classList.add('active');
  });
}

// ── LOADING BUTTON ─────────────────────────────
export function setLoading(btn, loading, label = 'Analisando...') {
  if (loading) {
    btn.disabled = true;
    btn.dataset.original = btn.textContent;
    btn.innerHTML = `<span class="spinner"></span> ${label}`;
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.original || 'Analisar';
  }
}

// ── FETCH PAGE HTML via proxy ──────────────────
export async function fetchHTML(url) {
  const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  return data.contents || '';
}

// ── CALL ANTHROPIC API ─────────────────────────
export async function askAI(prompt, maxTokens = 1000) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || 'Análise não disponível.';
}

// ── FORMAT DATE ────────────────────────────────
export function fmtDate(str) {
  try {
    return new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return str; }
}

// ── GUARD: redirect if not logged in ──────────
export function requireAuth() {
  import('./firebase-config.js').then(({ auth }) => {
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js').then(({ onAuthStateChanged }) => {
      onAuthStateChanged(auth, user => {
        if (!user) window.location.href = '../index.html';
      });
    });
  });
}

// ── BUILD SIDEBAR HTML ─────────────────────────
export function buildSidebar(activePage) {
  const navItems = [
    { page: 'dashboard.html', label: 'Visão Geral', icon: gridIcon() },
    { page: 'diagnostico.html', label: 'Diagnóstico SEO', icon: searchIcon() },
    { page: 'search-console.html', label: 'Search Console', icon: barIcon() },
    { page: 'concorrentes.html', label: 'Concorrentes', icon: usersIcon() },
    { page: 'ads.html', label: 'Recomendações Ads', icon: zapIcon() },
    { page: 'conteudo.html', label: 'Análise de Conteúdo', icon: fileIcon() },
    { page: 'monitoramento.html', label: 'Monitoramento', icon: activityIcon() },
    { page: 'noticias.html', label: 'Notícias SEO', icon: rssIcon() },
    { page: 'relatorios.html', label: 'Relatórios PDF', icon: downloadIcon() },
  ];
  const adminItems = [
    { page: 'clientes.html', label: 'Clientes', icon: briefcaseIcon() },
  ];

  return `
    <div class="sidebar-logo">
      <div class="logo-icon">${logoSvg()}</div>
      <div class="logo-text">SEO<span>Estratégia</span></div>
    </div>
    <nav class="sidebar-nav">
      ${navItems.map(i => `
        <button class="nav-item ${i.page === activePage ? 'active' : ''}" onclick="window.location.href='${i.page}'" data-page="${i.page}">
          ${i.icon} ${i.label}
        </button>`).join('')}
      <div class="nav-label" style="margin-top:12px">Admin</div>
      ${adminItems.map(i => `
        <button class="nav-item ${i.page === activePage ? 'active' : ''}" onclick="window.location.href='${i.page}'" data-page="${i.page}">
          ${i.icon} ${i.label}
        </button>`).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-email" id="sidebar-email">—</div>
        <div class="user-role">Administrador</div>
      </div>
      <button class="btn-logout" id="btn-logout">
        ${logoutIcon()} Sair
      </button>
    </div>`;
}

// ── ICONS ──────────────────────────────────────
function logoSvg() { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#080810" stroke-width="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`; }
function gridIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`; }
function searchIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`; }
function barIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`; }
function usersIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`; }
function zapIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`; }
function fileIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`; }
function activityIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`; }
function rssIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`; }
function downloadIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`; }
function briefcaseIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`; }
function logoutIcon() { return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`; }
export function chevronRight() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`; }
export function extLinkIcon() { return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`; }
