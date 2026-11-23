# 🎯 Front-end - Sistema de Achados e Perdidos

Interface web desenvolvida com **HTML5 + CSS3 + JavaScript Vanilla (ES Modules)**, comunicando-se com a API REST via **fetch**.

## 📁 Estrutura

```
frontend/
├── index.html           # Página principal (SPA)
├── assets/
│   ├── styles.css       # Estilos completos (CSS custom properties, responsivo)
│   └── app.js           # Lógica da aplicação (fetch, CRUD, UI)
├── vite.config.js       # Configuração do Vite (dev server + proxy)
├── package.json
└── dist/                # Build de produção (gerado após `npm run build`)
```

## 🚀 Como Executar

### 1. Pré-requisitos
- Node.js 18+
- Backend rodando em `http://localhost:3001` (veja `../backend/README.md`)

### 2. Instalar e Rodar
```bash
cd frontend
npm install
npm run dev
```

Front-end disponível em: **http://localhost:5173**

O Vite faz proxy automático para `/api` → `http://localhost:3001` (configurado em `vite.config.js`).

### 3. Build de Produção
```bash
npm run build
# Gera pasta dist/ pronta para deploy estático
```

### 4. Preview do Build
```bash
npm run preview
```

## 🌐 Deploy do Front-end

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```
- Detecta Vite automaticamente
- Configure variável de ambiente `VITE_API_URL` se necessário

### Netlify
- Arraste pasta `dist/` para o painel
- Ou conecte repositório GitHub

### GitHub Pages
```bash
npm run build
# Configure GitHub Actions para deploy automático da pasta dist/
```

### Qualquer Servidor Estático
```bash
# Python
cd dist && python -m http.server 8080

# Node (serve)
npx serve dist

# Nginx/Apache - sirva a pasta dist/
```

## ⚙️ Configuração de API

Em desenvolvimento, usa proxy do Vite (`/api` → `http://localhost:3001`).

Para produção, edite `vite.config.js` ou use variável de ambiente:

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://sua-api.railway.app',  // URL da API em produção
        changeOrigin: true
      }
    }
  }
});
```

Ou no build, o front-end fará requisições relativas para `/api/items` - configure seu servidor web (Nginx, Vercel, Netlify) para proxy reverso para a API.

## 🎨 Funcionalidades da Interface

- **Formulário** completo (cadastro/edição) com validação client-side
- **Tabela responsiva** com paginação
- **Filtros** em tempo real (busca textual, categoria, status)
- **Estatísticas** no header (total, disponíveis, devolvidos)
- **Modais** de confirmação para exclusão/mudança de status
- **Toasts** para feedback de sucesso/erro
- **Loading states** nos botões
- **Totalmente responsivo** (mobile-first)
- **Acessibilidade** (ARIA labels, navegação por teclado)

## 🔧 Personalização

### Cores (CSS Custom Properties)
Edite `:root` em `assets/styles.css`:
```css
:root {
  --color-primary: #2563eb;      /* Azul principal */
  --color-success: #10b981;      /* Verde sucesso */
  --color-danger: #ef4444;       /* Vermelho erro */
  --color-warning: #f59e0b;      /* Amarelo aviso */
  /* ... */
}
```

### Categorias
Edite os `<option>` em `index.html` (formulário e filtros):
```html
<option value="Nova Categoria">🎯 Nova Categoria</option>
```

## 📱 Responsividade

| Breakpoint | Layout |
|------------|--------|
| < 640px | Mobile (stack vertical, menus colapsados) |
| 640px - 1023px | Tablet (grid 2 colunas) |
| ≥ 1024px | Desktop (layout completo) |

## 🐛 Debug

### Console do Navegador
- Logs de requisições API
- Erros de fetch detalhados
- Estado da aplicação

### Network Tab
- Verifique requisições `/api/items`
- Status codes (200, 201, 400, 404, 500)
- Payloads JSON

### Problemas Comuns

| Problema | Solução |
|----------|---------|
| `CORS error` | Verifique `FRONTEND_URL` no backend `.env` |
| `401 Unauthorized` | Backend: use `service_role key` (não anon key) |
| `Failed to fetch` | Backend rodando? Porta 3001? Proxy Vite configurado? |
| `404 Not Found` | Rota da API correta? `/api/items` vs `/api/item` |

## 📝 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (porta 5173)
npm run build    # Build de produção (pasta dist/)
npm run preview  # Preview do build local
```