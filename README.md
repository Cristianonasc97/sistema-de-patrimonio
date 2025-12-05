# Sistema de Patrimônio - Frontend

Frontend web para o **Sistema de Patrimônio** desenvolvido com **React**, **TypeScript**, **Vite** e **Axios**.

Aplicação SPA (Single Page Application) que se conecta à API REST para gerenciar bens patrimoniais, movimentações e usuários.

---

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Funcionalidades](#-funcionalidades)
- [Deploy](#-deploy)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Type safety
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP com interceptors JWT
- **Tailwind CSS** - Styling (utility-first)
- **React Context** - State management (auth + reference data)

---

## 🏗️ Arquitetura

### Comunicação com API

```
┌─────────────────┐         HTTP/REST          ┌──────────────────┐
│  React Frontend │ ◄─────────────────────────► │   Fastify API    │
│   (Vite SPA)    │    JWT Authentication       │   (PostgreSQL)   │
└─────────────────┘                             └──────────────────┘
```

### Autenticação JWT

1. **Login** → API retorna JWT token
2. **Token armazenado** em `localStorage`
3. **Axios interceptor** injeta token automaticamente em todas requisições
4. **401 responses** → Logout automático + redirect para login

### Estrutura de Pastas

```
src/
├── components/        # Componentes reutilizáveis (Layout, etc.)
├── telas/            # Páginas/Screens (TelaBens, TelaLogin, etc.)
├── services/         # API clients (authService, dataService, etc.)
├── hooks/            # React hooks (useAutenticacao, useReferenceData)
├── config/           # Configuração (axios instance)
├── tipos.ts          # TypeScript types
└── App.tsx           # Root component
```

### Data Flow

- **Reference Data** (categorias, localizações, etc.) carregado após login
- **Forms** usam dropdowns dinâmicos populados do banco de dados
- **CRUD operations** enviam requisições HTTP para API
- **Optimistic updates** para melhor UX

---

## 📦 Pré-requisitos

### 1. Node.js
- **Node.js 18+** instalado
- Yarn ou npm

### 2. API Backend
A aplicação **requer** a API rodando:

**Opção A: API Local**
```bash
# Clone e configure a API
git clone https://github.com/FreitasAssis/sistema-de-patrimonio-api.git
cd sistema-de-patrimonio-api
yarn install
yarn db:migrate
yarn db:seed
yarn dev  # Roda em http://localhost:3000
```

**Opção B: API Deployed**
- Use API já deployada (Render, Railway, etc.)
- Exemplo: `https://sistema-de-patrimonio-api.onrender.com`

---

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Cristianonasc97/sistema-de-patrimonio.git
cd sistema-de-patrimonio
```

### 2. Instale as dependências

```bash
yarn install
# ou
npm install
```

### 3. Configure variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Development (API local)
VITE_API_URL=http://localhost:3000

# Production (API deployed)
# VITE_API_URL=https://sistema-de-patrimonio-api.onrender.com
```

**⚠️ IMPORTANTE:** A URL da API **NÃO** deve ter barra final (`/`)

### 4. Inicie o servidor de desenvolvimento

```bash
yarn dev
```

A aplicação estará disponível em: **http://localhost:5173**

---

## 🏃 Uso

### Desenvolvimento

```bash
yarn dev
```

Inicia servidor com hot-reload em `http://localhost:5173`

### Build para Produção

```bash
yarn build
```

Gera build otimizado na pasta `dist/`

### Preview da Build

```bash
yarn preview
```

Testa a build localmente antes do deploy

---

## ✨ Funcionalidades

### Autenticação
- ✅ Login com email/senha
- ✅ JWT token com expiração de 7 dias
- ✅ Logout
- ✅ Recuperação de senha
- ✅ Alteração de senha forçada (senha temporária)
- ✅ Proteção de rotas (redirecionamento automático)

### Gerenciamento de Bens
- ✅ Listar todos os bens
- ✅ Adicionar novo bem
  - Tombo (número único)
  - Nome
  - Categoria (dropdown do banco)
  - Localização (dropdown do banco)
  - Sala
  - Imagem do tombo (PNG, base64)
  - Foto do bem (JPG, base64)
- ✅ Editar bem existente
- ✅ Excluir bem (com confirmação)
- ✅ Visualizar imagens

### Movimentações (Empréstimos/Devoluções)
- ✅ Listar empréstimos ativos
- ✅ Histórico completo
- ✅ Registrar empréstimo
  - Seleção de bem
  - Nome da pessoa
  - Contato
  - Pastoral
  - Data de empréstimo
- ✅ Registrar devolução (endpoint dedicado)
- ✅ Filtros por status

### Inventário
- ✅ Visualização completa de bens
- ✅ Histórico de movimentações
- ✅ Filtros por:
  - Tombo
  - Nome
  - Categoria
  - Localização
  - Sala
  - Status (emprestado/devolvido)
- ✅ Visualização de imagens

### Relatórios
- ✅ Exportar lista de bens (PDF/Excel)
- ✅ Exportar movimentações (PDF/Excel)
- ✅ Dados com nomes legíveis (não UUIDs)

### Gerenciamento de Usuários (Admin)
- ✅ Listar usuários
- ✅ Adicionar usuário
- ✅ Atribuir perfil (ADMIN/USER)
- ✅ Excluir usuário
- ✅ Proteção: admin padrão não pode ser excluído

---

## 🚢 Deploy

### Opção 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variable
# VITE_API_URL = https://sua-api.onrender.com
```

**Configuração no Dashboard:**
1. Vá em **Settings** → **Environment Variables**
2. Adicione `VITE_API_URL` com URL da sua API
3. **Redeploy** para aplicar mudanças

### Opção 2: Netlify

```bash
# Build local
yarn build

# Deploy via Netlify CLI
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Environment Variables:**
- `VITE_API_URL` = URL da sua API deployada

### Opção 3: Render Static Site

1. Conecte repositório GitHub
2. **Build Command**: `yarn build`
3. **Publish Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL` = URL da API

### Opção 4: Build Manual + Hosting

```bash
# Build
yarn build

# Resultado em dist/
# Upload para qualquer hosting estático:
# - GitHub Pages
# - AWS S3 + CloudFront
# - Firebase Hosting
# - etc.
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'axios'"

**Causa:** VSCode com Yarn PnP não reconhecendo módulos

**Solução:**
```bash
# Gerar SDKs do Yarn para VSCode
yarn dlx @yarnpkg/sdks vscode

# No VSCode:
# Cmd+Shift+P → "TypeScript: Select TypeScript Version"
# Escolher "Use Workspace Version"
```

### Erro: Network Error / Failed to fetch

**Causa:** API não está rodando ou URL incorreta

**Solução:**
1. Verifique se API está rodando:
   ```bash
   curl http://localhost:3000/health
   ```
2. Confirme `VITE_API_URL` no `.env`
3. Verifique CORS na API (deve permitir `http://localhost:5173`)

### Erro: 401 Unauthorized

**Causa:** Token expirado ou inválido

**Solução:**
- Faça login novamente
- Token expira em 7 dias
- Limpe localStorage se necessário:
  ```javascript
  localStorage.clear()
  ```

### Erro: Request body is too large

**Causa:** Imagens base64 muito grandes

**Solução:**
- API tem limite de 10MB (já configurado)
- Reduza tamanho/qualidade das imagens antes do upload
- Ou aumente `bodyLimit` no servidor API

### Dropdowns vazios (Categoria/Localização)

**Causa:** Reference data não carregou

**Solução:**
1. Verifique se está autenticado (dropdowns só carregam após login)
2. Verifique console do navegador para erros de API
3. Confirme que API tem dados:
   ```bash
   curl http://localhost:3000/api/categorias \
     -H "Authorization: Bearer SEU_TOKEN"
   ```

### CORS Error

**Causa:** API não configurada para aceitar requisições do frontend

**Solução:**
No `.env` da API, configure:
```env
FRONTEND_URL=http://localhost:5173
```

E reinicie a API.

---

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev              # Inicia dev server (hot reload)

# Build
yarn build            # Build para produção

# Preview
yarn preview          # Testa build localmente

# Type check
yarn tsc              # Verifica erros TypeScript

# Lint (se configurado)
yarn lint             # ESLint
```

---

## 🔄 Fluxo de Desenvolvimento

### 1. Desenvolvimento Local

```bash
# Terminal 1: API
cd sistema-de-patrimonio-api
yarn dev  # http://localhost:3000

# Terminal 2: Frontend
cd sistema-de-patrimonio
yarn dev  # http://localhost:5173
```

### 2. Testar Funcionalidade

1. Acesse `http://localhost:5173`
2. Login: `admin@email.com` / `admin123`
3. Teste CRUD operations
4. Verifique console para erros

### 3. Deploy

```bash
# Build local
yarn build

# Teste preview
yarn preview

# Deploy (Vercel exemplo)
vercel --prod
```

---

## 🔗 Dependência da API

Este frontend **requer** a API rodando. Repositório da API:

👉 **[sistema-de-patrimonio-api](https://github.com/[seu-usuario]/sistema-de-patrimonio-api)**

### Setup Completo (Backend + Frontend)

1. **Clone ambos repositórios**:
   ```bash
   git clone https://github.com/[seu-usuario]/sistema-de-patrimonio-api.git
   git clone https://github.com/[seu-usuario]/sistema-de-patrimonio.git
   ```

2. **Configure e rode API** (veja README da API)

3. **Configure e rode Frontend** (este README)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📝 Changelog

### v2.0.0 (2024-12-05)

- ✅ Migração completa de SQLite → REST API
- ✅ Autenticação JWT
- ✅ Reference data dinâmica (banco de dados)
- ✅ Dropdowns populados automaticamente
- ✅ Axios interceptors para auth automática
- ✅ Tratamento de 401 (logout automático)
- ✅ Context API para auth e reference data
- ✅ Suporte a imagens base64 (até 10MB)

### v1.0.0 (versão anterior)

- SQLite browser-based
- IndexedDB persistence
- Modo offline (descontinuado)

---

## 📄 Licença

MIT

---

## 🆘 Suporte

**Problemas comuns:**

1. ✅ Verifique se API está rodando
2. ✅ Confirme `.env` configurado corretamente
3. ✅ Teste login com credenciais padrão
4. ✅ Verifique console do navegador para erros
5. ✅ Confirme CORS configurado na API

**Logs úteis:**
- Console do navegador (F12)
- Network tab (requisições HTTP)
- Logs da API (terminal)

---

**Desenvolvido com ❤️ para gerenciamento de patrimônio de nossa paróquia**
