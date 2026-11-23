# Sistema de Achados e Perdidos

CRUD completo para gerenciamento de objetos achados e perdidos.
Arquitetura desacoplada: **Back-end (API REST)** + **Front-end (SPA)**, comunicando via `fetch` (HTTP/JSON).

## Estrutura

```
.
├── backend/          # API REST (Node.js + Express + Supabase)
│   ├── src/
│   │   ├── config/supabase.js
│   │   ├── controllers/itemController.js
│   │   ├── middleware/errorHandler.js
│   │   ├── models/LostFoundItem.js
│   │   ├── routes/items.js
│   │   └── server.js
│   ├── supabase-migration.sql
│   ├── .env
│   └── package.json
│
├── frontend/         # SPA (Vite + Vanilla JS + CSS)
│   ├── index.html
│   ├── assets/
│   │   ├── styles.css
│   │   └── app.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Pre-requisitos

- Node.js 18+
- Conta no Supabase (gratuito)

## 1. Configurar Supabase

1. Crie um projeto no [Supabase Dashboard](https://app.supabase.com)
2. Va em **Settings -> API** e copie:
   - **Project URL** (ex: `https://xyz.supabase.co`)
   - **service_role** key (NÃO use a anon/publishable)
3. No **SQL Editor**, execute o conteudo de `backend/supabase-migration.sql`

## 2. Configurar e rodar o Back-end

```bash
cd backend
npm install
```

Edite `backend/.env`:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_service_role_key_aqui
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Rodar:
```bash
cd backend
npm run dev
```

API disponivel em: `http://localhost:3001`

## 3. Configurar e rodar o Front-end

```bash
cd frontend
npm install
npm run dev
```

Front-end disponivel em: `http://localhost:5173`

O Vite faz proxy automatico de `/api` para `http://localhost:3001`.

## Como rodar tudo junto

Abra dois terminais:

**Terminal 1:**
```bash
cd backend && npm run dev
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

Acesse: `http://localhost:5173`

## Endpoints da API

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/api/items` | Listar itens (filtros: search, category, status, limit, offset) |
| GET | `/api/items/stats` | Estatisticas |
| GET | `/api/items/:id` | Buscar por ID |
| POST | `/api/items` | Criar item |
| PUT | `/api/items/:id` | Atualizar completo |
| PATCH | `/api/items/:id` | Atualizar parcial |
| PATCH | `/api/items/:id/status` | Atualizar status |
| DELETE | `/api/items/:id` | Excluir |

## Testes manuais

### Testar API via curl

```bash
# Health check
curl http://localhost:3001/health

# Criar item
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"description":"Mochila preta","category":"Acessorios","location_found":"Biblioteca","status":"disponivel"}'

# Listar todos
curl http://localhost:3001/api/items

# Estatisticas
curl http://localhost:3001/api/items/stats

# Buscar por ID (substitua o UUID)
curl http://localhost:3001/api/items/00000000-0000-0000-0000-000000000000

# Atualizar status
curl -X PATCH http://localhost:3001/api/items/00000000-0000-0000-0000-000000000000/status \
  -H "Content-Type: application/json" \
  -d '{"status":"devolvido"}'

# Excluir
curl -X DELETE http://localhost:3001/api/items/00000000-0000-0000-0000-000000000000
```

### Testar via navegador

1. Abra `http://localhost:5173`
2. Cadastre um item no formulario
3. Verifique se aparece na tabela
4. Teste filtros (busca, categoria, status)
5. Teste editar item (botao lapis)
6. Teste mudar status (botao check)
7. Teste excluir (botao lixeira + confirmacao)
8. Verifique estatisticas no header atualizam

### Checklist de validacao

- [ ] Backend inicia sem erros (`npm run dev`)
- [ ] Frontend inicia sem erros (`npm run dev`)
- [ ] Health check responde (`/health`)
- [ ] Criar item funciona (POST)
- [ ] Listar itens funciona (GET)
- [ ] Filtrar por status funciona
- [ ] Filtrar por categoria funciona
- [ ] Busca textual funciona
- [ ] Editar item funciona (PATCH)
- [ ] Mudar status funciona
- [ ] Excluir item funciona (DELETE)
- [ ] Estatisticas atualizam em tempo real
- [ ] Validacao client-side funciona (campos vazios)
- [ ] Validacao server-side funciona (dados invalidos)
- [ ] Tratamento de erro funciona (item nao encontrado)
- [ ] Responsivo em mobile

## Build de producao

### Front-end
```bash
cd frontend
npm run build
# Gera pasta dist/ pronta para deploy
```

### Back-end
```bash
cd backend
npm start
```

## Deploy

### Backend (Railway, Render, Fly.io, Docker)
```bash
cd backend
npm install
npm start
```
Configure variaveis de ambiente no painel do servico.

### Frontend (Vercel, Netlify, GitHub Pages)
```bash
cd frontend
npm run build
# Deploy pasta dist/
```
Configure proxy reverso para `/api` apontar para a URL do backend.

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Back-end | Node.js 18+ (ES Modules) |
| Framework | Express.js 4.19 |
| Banco de dados | Supabase (PostgreSQL) |
| Client DB | @supabase/supabase-js v2 |
| Front-end | Vite 5 |
| Front-end JS | Vanilla ES Modules (fetch API) |
| CSS | Custom Properties, Flexbox/Grid, Mobile-first |

## Licenca

MIT - Uso livre para fins educacionais e comerciais.