# SEOEstratégia 🚀

Ferramenta completa de diagnóstico SEO em HTML + CSS + JS puro.

## Estrutura

```
seoestrategia/
├── index.html              ← Login
├── css/
│   └── style.css           ← Todo o CSS
├── js/
│   ├── firebase-config.js  ← Suas credenciais Firebase
│   └── utils.js            ← Funções compartilhadas
└── pages/
    ├── dashboard.html
    ├── diagnostico.html
    ├── search-console.html
    ├── concorrentes.html
    ├── ads.html
    ├── conteudo.html
    ├── monitoramento.html
    ├── noticias.html
    ├── relatorios.html
    └── clientes.html
```

## Setup

### 1. Configure o Firebase
Abra `js/firebase-config.js` e cole suas credenciais do Firebase.

### 2. Ative no Firebase Console
- Authentication → Email/Senha → Ativar
- Firestore Database → já criado em modo produção ✅
- Cole as regras do `firestore.rules`

### 3. Crie o primeiro usuário admin
No Firebase Console → Authentication → Add User → crie seu email/senha de admin.

### 4. Suba no GitHub e conecte na Vercel
```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/seu-usuario/seoestrategia.git
git push -u origin main
```
Depois conecte o repositório na Vercel — deploy automático.

## Tecnologias
- HTML + CSS + JS puro (sem framework)
- Firebase Authentication + Firestore
- API Anthropic (claude-sonnet-4-20250514)
- Hospedagem: GitHub + Vercel
