# 🎯 Backend - API REST (Sistema de Achados e Perdidos)

API RESTful desenvolvida com **Node.js + Express** e **Supabase (PostgreSQL)**.

## 📁 Estrutura

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js        # Cliente Supabase configurado
│   ├── controllers/
│   │   └── itemController.js  # Controladores da API
│   ├── middleware/
│   │   └── errorHandler.js    # Tratamento global de erros
│   ├── models/
│   │   └── LostFoundItem.js   # Modelo de dados + validações
│   ├── routes/
│   │   └── items.js           # Rotas REST (/api/items)
│   └── server.js              # Entry point
├── supabase-migration.sql     # SQL para criar tabela no Supabase
├── package.json
├── .env                       # Variáveis de ambiente
└── .env.example               # Exemplo de configuração
```

## 🚀 Como Executar

### 1. Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 2. Configurar Supabase
1. Crie um projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings → API** e copie:
   - **Project URL** (ex: `https://xyz.supabase.co`)
   - **service_role** key (⚠️ **NÃO** use a chave `anon`/`publishable`!)
3. No **SQL Editor**, execute o conteúdo de `supabase-migration.sql`

### 3. Configurar o Projeto
```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas credenciais
```

**Arquivo `.env`:**
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_service_role_key_aqui
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Executar
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

API disponível em: **http://localhost:3001**

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Health check |
| `GET` | `/api/items` | Listar itens (filtros: `search`, `category`, `status`, `limit`, `offset`) |
| `GET` | `/api/items/stats` | Estatísticas (total, disponíveis, devolvidos) |
| `GET` | `/api/items/:id` | Buscar item por ID |
| `POST` | `/api/items` | Criar novo item |
| `PUT` | `/api/items/:id` | Atualizar item completo |
| `PATCH` | `/api/items/:id` | Atualização parcial |
| `PATCH` | `/api/items/:id/status` | Atualizar apenas status |
| `DELETE` | `/api/items/:id` | Excluir item |

### Exemplos

**Criar item:**
```bash
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Mochila preta com adesivos",
    "category": "Acessórios",
    "location_found": "Biblioteca - 2º andar",
    "status": "disponivel"
  }'
```

**Listar com filtros:**
```bash
curl "http://localhost:3001/api/items?status=disponivel&category=Eletrônicos&search=mochila&limit=5"
```

## 🔒 CORS

O backend aceita requisições das origens configuradas em `FRONTEND_URL` (padrão: `http://localhost:5173`).

Para produção, altere no `.env`:
```env
FRONTEND_URL=https://seu-frontend.vercel.app
```

## 🛠️ Deploy

### Railway / Render / Fly.io
1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente
3. Deploy automático

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📝 Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `SUPABASE_URL` | Sim | URL do projeto Supabase |
| `SUPABASE_KEY` | Sim | Service role key do Supabase |
| `PORT` | Não | Porta do servidor (padrão: 3001) |
| `NODE_ENV` | Não | Ambiente (development/production) |
| `FRONTEND_URL` | Não | URL do front-end para CORS |

## 🧪 Testes Manuais

```bash
# Health check
curl http://localhost:3001/health

# Criar item
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"description":"Teste","category":"Outros","location_found":"Local teste"}'

# Listar todos
curl http://localhost:3001/api/items

# Estatísticas
curl http://localhost:3001/api/items/stats
```