# Deploy passo a passo (GitHub + Render + Vercel)

Siga nesta ordem. Tempo estimado: **30–45 min**.

---

## Passo 1 — GitHub (código)

1. Acesse [github.com/new](https://github.com/new)
2. **Repository name:** `CoopersChallenge` (ou outro nome)
3. Deixe **sem** README, .gitignore ou license (já existem no projeto)
4. Clique **Create repository**
5. No PowerShell, na pasta do projeto:

```powershell
cd C:\Users\yuris\Desktop\CoopersChallenge
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/CoopersChallenge.git
git push -u origin main
```

Troque `SEU_USUARIO` pelo seu login do GitHub.

**Problema com senha?** Use [Personal Access Token](https://github.com/settings/tokens) como senha, ou instale [GitHub Desktop](https://desktop.github.com/).

---

## Passo 2 — API no Render

1. [dashboard.render.com](https://dashboard.render.com) → **Sign In** (conta grátis)
2. **New +** → **Web Service**
3. Conecte o GitHub e escolha o repositório `CoopersChallenge`
4. Configuração:

| Campo | Valor |
|--------|--------|
| **Name** | `coopers-api` |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma db push` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

5. **Environment** → adicione:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Cole do seu `server/.env` (Neon) |
| `JWT_SECRET` | Cole do seu `server/.env` |
| `CLIENT_ORIGIN` | `https://SEU-APP.vercel.app` *(ajuste depois do passo 3)* |
| `CONTACT_TO_EMAIL` | seu e-mail |
| `SMTP_HOST` | ex. `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | usuário SMTP |
| `SMTP_PASS` | senha SMTP |
| `SMTP_FROM` | e-mail remetente |

6. **Create Web Service** e aguarde o deploy (5–10 min).
7. Copie a URL pública, ex.: `https://coopers-api.onrender.com`
8. Teste no navegador: `https://coopers-api.onrender.com/api/health` → deve retornar `{"ok":true,...}`

---

## Passo 3 — Front na Vercel

1. [vercel.com](https://vercel.com) → login com GitHub
2. **Add New…** → **Project** → importe `CoopersChallenge`
3. Configuração:

| Campo | Valor |
|--------|--------|
| **Root Directory** | `client` (Edit → Framework Preset: Vite) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. **Environment Variables:**

| Name | Value |
|------|--------|
| `VITE_API_URL` | URL do Render **sem barra no final**, ex. `https://coopers-api.onrender.com` |

5. **Deploy**
6. Copie a URL do site, ex.: `https://coopers-challenge.vercel.app`

---

## Passo 4 — Ligar front e API

1. Volte ao **Render** → seu serviço → **Environment**
2. Edite `CLIENT_ORIGIN` para a URL **exata** da Vercel (com `https://`, sem `/` no final)
3. **Save Changes** (o Render redeploya sozinho)

---

## Passo 5 — Testar em produção

- [ ] Abrir a URL da Vercel
- [ ] **Cadastro** em `/cadastro`
- [ ] **Login** e criar tarefas na home (`#todo-list`) ou `/app`
- [ ] Marcar done, editar, hover delete, arrastar
- [ ] Formulário **get in touch** (precisa SMTP no Render)
- [ ] Rotas `/login`, `/cadastro`, `/app` sem 404

---

## Passo 6 — Preencher entrega

Edite [ENTREGA.md](./ENTREGA.md) com os três links e envie junto com [PROCESSO.md](./PROCESSO.md).

---

## SMTP grátis (Brevo — exemplo)

1. [brevo.com](https://www.brevo.com) → conta grátis
2. **SMTP & API** → credenciais SMTP
3. No Render use:
   - `SMTP_HOST=smtp-relay.brevo.com`
   - `SMTP_PORT=587`
   - `SMTP_USER` = login SMTP
   - `SMTP_PASS` = chave SMTP

---

## Problemas comuns

| Sintoma | Solução |
|---------|---------|
| Login não mantém sessão | `CLIENT_ORIGIN` deve ser **igual** à URL da Vercel; `NODE_ENV=production` no Render |
| API “sleep” no free | Primeira requisição demora ~30s — normal no plano grátis |
| Contato erro 500 | Configure SMTP ou veja **Logs** no Render |
| CORS error | `CLIENT_ORIGIN` errado ou com barra extra no final |
