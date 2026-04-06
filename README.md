# SEOEstratégia 🚀

Ferramenta de diagnóstico SEO inteligente com integração ao Google Search Console, análise por IA e painel multi-cliente.

## Tecnologias

- **Next.js 14** (App Router)
- **Firebase** (Auth + Firestore)
- **Cloudinary** (armazenamento de PDFs)
- **Vercel** (deploy)

## Como rodar localmente

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/seoestrategia.git
cd seoestrategia
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.local.example .env.local
```
Preencha o `.env.local` com suas credenciais do Firebase, Google e Cloudinary.

### 4. Rode o projeto
```bash
npm run dev
```
Acesse: http://localhost:3000

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx                  # Login
│   ├── layout.tsx                # Layout global
│   ├── globals.css               # Design system
│   └── dashboard/
│       ├── layout.tsx            # Sidebar + autenticação
│       ├── page.tsx              # Visão geral
│       ├── diagnostico/          # Diagnóstico SEO técnico
│       ├── search-console/       # Integração Search Console
│       ├── concorrentes/         # Análise de concorrentes
│       ├── ads/                  # Recomendações de Ads
│       ├── conteudo/             # Análise de conteúdo com IA
│       ├── monitoramento/        # Histórico de rankings
│       ├── noticias/             # Feed de notícias SEO
│       ├── relatorios/           # Export PDF
│       └── clientes/             # Painel admin multi-cliente
├── components/                   # Componentes reutilizáveis
├── lib/
│   ├── firebase.ts               # Configuração Firebase
│   └── db-structure.ts           # Documentação do banco
└── hooks/                        # Custom hooks
```

## Funcionalidades

- [x] Autenticação com Firebase
- [x] Sidebar com navegação
- [x] Design system dark mode
- [ ] Diagnóstico SEO técnico
- [ ] Integração Search Console
- [ ] Feed de notícias SEO
- [ ] Análise de concorrentes
- [ ] Recomendações de Ads com IA
- [ ] Análise de conteúdo com IA
- [ ] Monitoramento de posição
- [ ] Alertas por email
- [ ] Export PDF
- [ ] Sistema multi-cliente (SSO Firebase)
- [ ] Painel admin master

## Deploy

```bash
vercel --prod
```
Adicione as variáveis de ambiente no painel da Vercel antes do deploy.
