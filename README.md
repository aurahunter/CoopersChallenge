# Coopers — desafio Full Stack

Monorepo: **React (Vite)** em `client/` e **Node (Express)** em `server/`, com **Prisma** + **PostgreSQL**.

**Entrega:** preencha [ENTREGA.md](./ENTREGA.md) com os links públicos.  
**Relatório do processo:** [PROCESSO.md](./PROCESSO.md).

## Funcionalidades

- **Landing** (mobile first): hero, to-do embutido, carrossel “good things”, formulário de contato, footer.
- **Auth**: cadastro/login com **JWT** em cookie **httpOnly** (`credentials: "include"` no front).
- **To-do**: CRUD + reordenar (`PATCH /api/tasks/reorder`) com drag-and-drop.
- **Contato**: `POST /api/contact` — envia e-mail via SMTP (ou grava no log da API em desenvolvimento).

## Pré-requisitos

- [Node.js](https://nodejs.org/) LTS (v18+)
- PostgreSQL ([Neon](https://neon.tech) gratuito, ou local)

## Banco de dados (uma vez)

1. Crie um banco e copie a connection string (`postgresql://...`).
2. Cole em `server/.env` → `DATABASE_URL=`.
3. No terminal:

```bash
cd server
npx prisma db push
```

Opcional: `npm run db:studio` para inspecionar dados.

## Rodar local

### API

```bash
cd server
npm install
copy .env.example .env
# Edite: DATABASE_URL, JWT_SECRET
npm run dev
```

→ [http://localhost:4000/api/health](http://localhost:4000/api/health)

### Front

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

→ [http://localhost:5173](http://localhost:5173)

`client/.env`: `VITE_API_URL=http://localhost:4000`

**Rotas:** `/` (landing), `/login`, `/cadastro`, `/app` (to-do autenticado).

## API (resumo)

| Método | Caminho | Auth | Descrição |
|--------|---------|------|-----------|
| GET | `/api/health` | Não | Status |
| POST | `/api/auth/register` | Não | `{ email, password }` |
| POST | `/api/auth/login` | Não | `{ email, password }` |
| POST | `/api/auth/logout` | Não | Remove cookie |
| GET | `/api/auth/me` | Cookie | Usuário atual |
| GET/POST/PATCH/DELETE | `/api/tasks`… | Cookie | CRUD + reorder |
| POST | `/api/contact` | Não | `{ name, email, phone, message }` |

## Deploy (produção)

Front e API em domínios diferentes exigem **HTTPS**, **CORS** com a URL exata do front e cookies `SameSite=None; Secure` (já configurado quando `NODE_ENV=production`).

### 1. API no [Render](https://render.com)

1. Envie o projeto para o **GitHub** (não commite `.env`).
2. **New → Web Service** → repositório, **Root Directory:** `server`.
3. **Build Command:** `npm install && npx prisma generate && npx prisma db push`
4. **Start Command:** `npm start`
5. Variáveis de ambiente:

| Variável | Exemplo |
|----------|---------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | string do Neon |
| `JWT_SECRET` | string longa aleatória |
| `CLIENT_ORIGIN` | `https://seu-app.vercel.app` |
| `CONTACT_TO_EMAIL` | e-mail que recebe contatos |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | provedor SMTP |

Anote a URL da API, ex.: `https://coopers-api.onrender.com`.

Há um `render.yaml` na raiz para deploy via Blueprint (ajuste o nome do serviço se quiser).

### 2. Front na [Vercel](https://vercel.com)

1. **Import Project** → repositório, **Root Directory:** `client`.
2. **Framework:** Vite.
3. Variável de ambiente:

| Variável | Valor |
|----------|--------|
| `VITE_API_URL` | URL da API no Render (sem `/` no final) |

4. Deploy. O `client/vercel.json` redireciona rotas do React Router para `index.html`.

### 3. Conferir

- `GET https://sua-api.onrender.com/api/health` → `{ "ok": true }`
- Abrir o site, cadastrar, logar, criar tarefas, enviar contato.
- No Render, `CLIENT_ORIGIN` deve ser **exatamente** a URL do Vercel (com `https://`, sem barra final).

### Contato em produção

Sem `SMTP_HOST`, o formulário retorna erro 500 em produção. Configure SMTP (Brevo, Resend, Gmail com senha de app, etc.) nas variáveis do Render.

## Variáveis de ambiente

- `server/.env.example` — API, JWT, SMTP, `CLIENT_ORIGIN`
- `client/.env.example` — `VITE_API_URL`

## Processo / decisões

- **Cookie em vez de localStorage** para o JWT reduz risco de XSS roubar o token.
- **Prisma + Neon** para não depender de Postgres local no deploy.
- **Landing + TodoBoard `embedded`** evita duplicar títulos da seção to-do.
- **Carrossel**: `scroll-snap` + auto-play; `scrollTargetRef` evita bug de bolinha ao voltar do último slide.
- **Contato**: Nodemailer; em dev sem SMTP a mensagem aparece no log do servidor.
- **Deploy**: Vercel (estático) + Render (Node); cookies cross-site com `SameSite=None` em produção.

## Estrutura

```
client/          # Vite + React
  src/components/landing/
  vercel.json
server/          # Express + Prisma
  src/routes/
  prisma/
render.yaml
```
