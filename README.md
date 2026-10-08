# CidadeAlerta
Plataforma de alertas urbanos onde cidadãos reportam problemas da cidade (buracos, postes apagados, vazamentos) e acompanham a resolução em tempo real. Moderadores e admins gerenciam status, categorias e usuários.

Monorepo com `backend/` (API REST + GraphQL) e `frontend/` (SPA React).

---

## Tecnologias

### Backend
- Node.js + Express 5 — servidor HTTP
- MongoDB + Mongoose — banco de dados
- Apollo Server + GraphQL — API GraphQL
- JWT (jsonwebtoken) — autenticação
- bcryptjs — hash de senhas
- express-validator — validação de dados
- multer + graphql-upload-minimal — upload de imagens
- cors + dotenv — middlewares

### Frontend
- React 19 + React Router DOM 7 — SPA e roteamento
- Vite 8 — bundler e dev server
- Apollo Client 4 + graphql + apollo-upload-client — consumo GraphQL com upload
- lucide-react — ícones
- CSS puro (index.css minificado) — estilização sem framework
- Context API — AuthContext e ToastContext

---

## Como Rodar

- Node.js 18 ou versão superior
- MongoDB rodando localmente ou MongoDB Atlas

### Backend

#### 1. Instalar dependências
```bash
cd backend
npm install
```

#### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do `backend/`:
```
PORT=3000
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/cidadealerta
JWT_SECRET=sua_chave_secreta_aqui
```

#### 3. Iniciar o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O servidor estará disponível em:
- API REST: http://localhost:3000/api
- GraphQL: http://localhost:3000/graphql
- Health: http://localhost:3000/api/health
- Uploads: http://localhost:3000/uploads

### Frontend

#### 1. Instalar dependências
```bash
cd frontend
npm install
```

#### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do `frontend/`:
```
VITE_API_URL=/api
VITE_GRAPHQL_URL=/graphql
```
> Em produção use URL absoluta: `VITE_API_URL=https://seu-dominio.com/api`

#### 3. Iniciar o app
```bash
# Desenvolvimento (com proxy para o backend)
npm run dev

# Build de produção
npm run build
npm run preview
```

App disponível em: http://localhost:5173
> O `vite.config.js` já faz proxy de `/api`, `/graphql` e `/uploads` para `http://localhost:3000` no modo dev.

---

## Variáveis de Ambiente

### Backend (`backend/.env`)
| Variável | Obrigatória | Exemplo | Descrição |
|---|---|---|---|
| `PORT` | não | `3000` | Porta do servidor Express |
| `MONGODB_URI` | sim | `mongodb://localhost:27017/cidadealerta` | String de conexão MongoDB |
| `JWT_SECRET` | sim | `super_secreto_123` | Chave para assinar/verificar JWT (expira em 1d) |

### Frontend (`frontend/.env`)
| Variável | Obrigatória | Exemplo | Descrição |
|---|---|---|---|
| `VITE_API_URL` | não | `/api` | URL base da API REST |
| `VITE_GRAPHQL_URL` | não | `/graphql` | URL do endpoint GraphQL |

---

## Endpoints da API REST

### Auth
POST `/api/auth/registrar` - Registrar novo usuário
POST `/api/auth/login` - Fazer login e receber token
GET `/api/auth/perfil` - Ver perfil do usuário logado (Bearer token)

### Usuários
GET `/api/usuarios` - admin - Listar todos os usuários
GET `/api/usuarios/:id` - admin - Detalhes de um usuário
PUT `/api/usuarios/:id` - próprio/admin - Atualizar nome/email
PATCH `/api/usuarios/:id/papel` - admin - Alterar perfil (cidadao/moderador/admin)
PATCH `/api/usuarios/:id/status` - admin - Ativar/desativar conta

### Categorias
GET `/api/categorias` - Listar categorias ativas
GET `/api/categorias/:id` - Detalhes de uma categoria
POST `/api/categorias` - admin - Criar categoria
PUT `/api/categorias/:id` - admin - Atualizar categoria
DELETE `/api/categorias/:id` - admin - Deletar categoria

### Reportes
GET `/api/reportes` - Listar com filtros e paginação
GET `/api/reportes/autenticado` - Reportes do usuário logado (Bearer)
GET `/api/reportes/:id` - Detalhes de um reporte
GET `/api/reportes/:id/historico` - Histórico de mudanças de status
POST `/api/reportes` - Criar reporte (multipart, até 5 imagens)
PUT `/api/reportes/:id` - autor - Editar reporte
PATCH `/api/reportes/:id/status` - admin/moderador - Alterar status
DELETE `/api/reportes/:id` - admin - Deletar reporte

### Comentários
POST `/api/reportes/:id/comentarios` - Adicionar comentário (autenticado)
GET `/api/reportes/:id/comentarios` - Listar comentários
DELETE `/api/comentarios/:id` - Deletar (autor ou admin)

### Dashboard
GET `/api/dashboard/estatisticas` - admin/moderador - Contagem por status
GET `/api/dashboard/por-categoria` - admin/moderador - Contagem por categoria
GET `/api/dashboard/por-periodo?dias=30` - admin/moderador - Reportes por dia

---

## GraphQL

Acesse o Apollo Sandbox em http://localhost:3000/graphql para testar.

### Queries

```graphql
# Listar reportes com filtros e paginação
query {
  reportes(status: "aberto", pagina: 1, limite: 5) {
    reportes { id titulo status categoria { nome } autor { nome } }
    paginacao { total paginas }
  }
}

# Estatísticas do dashboard
query {
  estatisticasDashboard { total porStatus { _id quantidade } }
}

# Categorias
query { categorias { id nome descricao isAtivo } }
```

### Mutations

```graphql
# Registrar
mutation {
  registro(entrada: { nome: "Novo User", email: "novo@email.com", senha: "12345678" }) {
    token
    usuario { id nome email perfil }
  }
}

# Login
mutation {
  login(email: "joao@email.com", senha: "joao123") {
    token
    usuario { id nome perfil }
  }
}

# Criar reporte (requer Authorization: Bearer <token>)
mutation {
  criarReporte(entrada: {
    titulo: "Problema teste"
    descricao: "Descrição do problema encontrado"
    categoria: "id_da_categoria"
    localizacao: { type: "Point", coordinates: [-43.17, -22.90] }
  }) { id titulo status }
}

# Adicionar comentário
mutation {
  adicionarComentario(reporteId: "id_do_reporte", conteudo: "Meu comentário") {
    id conteudo autor { nome }
  }
}
```

Para mutations que requerem autenticação, envie no header:
```
Authorization: Bearer seu_token_aqui
```

---

## Frontend — Rotas e Páginas

| Rota | Página | Acesso | Descrição |
|---|---|---|---|
| `/` | HomePage | público | Hero + CTA Criar/Explorar |
| `/login` | LoginPage | público | Formulário email/senha |
| `/registro` | RegistroPage | público | Criação de conta (senha mín 8) |
| `/reportes` | ReportesPage | público | Lista com filtros status/categoria + paginação (10 por pág) |
| `/reportes/novo` | ReporteFormPage | privado | Criar reporte com upload (5 imgs), GPS via EXIF ou botão GPS |
| `/reportes/:id` | ReporteDetalhePage | público | Detalhe + comentários + histórico + alterar status (moderador) |
| `/reportes/:id/editar` | ReporteFormPage | privado (autor) | Edição de título/descrição/categoria/endereço |
| `/meus-reportes` | MeusReportesPage | privado | Reportes do usuário logado |
| `/dashboard` | DashboardPage | moderador/admin | Gráficos por status, categoria e período (7/14/30/60/90 dias) |
| `/admin/categorias` | CategoriasAdminPage | admin | CRUD de categorias |
| `/admin/usuarios` | UsuariosAdminPage | admin | Listar, trocar papel e ativar/desativar |
| `*` | 404 | público | Página não encontrada |

Componentes principais:
- `Navbar` — navegação responsiva com menu mobile
- `RotaProtegida` — `RotaPrivada`, `RotaAdmin`, `RotaModerador`
- `AuthContext` — login/registro/logout, `carregarPerfil()`, `isAdmin/isModerador`
- `ToastContext` — notificações success/error/info
- `services/api.js` — `authApi`, `reportesApi`, `categoriasApi`, `usuariosApi` (fetch com JWT)
- `graphql/client.js` — Apollo Client com `UploadHttpLink` + `SetContextLink` (JWT) + `ErrorLink`
- `utils/exif.js` — `extrairGpsDoExif()` lê GPS de JPEG via DataView
- `utils/helpers.js` — `STATUS_LABELS`, `formatarData`, `tempoRelativo()`, `getIniciais()`

---

## Frontend — Estrutura

```
frontend/
  src/
    components/   # Navbar, RotaProtegida
    contexts/     # AuthContext, ToastContext
    graphql/      # client.js, operations.js
    pages/        # 10 páginas (Home, Login, Registro, Reportes, etc)
    services/     # api.js (fetch REST)
    utils/        # exif.js, helpers.js
    assets/       # logo, hero
    App.jsx       # BrowserRouter + rotas
    main.jsx      # ApolloProvider + StrictMode + serviceWorker
    index.css     # CSS puro minificado (26kB, 1 linha)
  vite.config.js  # proxy /api /graphql /uploads -> localhost:3000
  index.html
```

---

## Scripts

### Backend
```bash
npm run dev   # Inicia com nodemon
npm start     # Inicia em produção
```

### Frontend
```bash
npm run dev     # Vite dev server na porta 5173
npm run build   # Gera dist/ para produção
npm run preview # Serve o build localmente
npm run lint    # oxlint
```

