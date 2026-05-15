# Processo de desenvolvimento — Coopers Challenge

Documento para entrega do desafio: decisões, dificuldades e soluções adotadas.

## Visão geral

O projeto foi estruturado como monorepo com **Vite + React** (`client/`) e **Express + Prisma + PostgreSQL** (`server/`). A landing replica o layout mobile first do Figma em uma única página; autenticação, to-do e contato integram-se à API.

## Etapa 1 — Front-end e layout

### Abordagem

- Componente principal `CoopersLanding.jsx` com CSS escopado em `.coopers` (`landing.css`), evitando vazamento de estilos para outras rotas.
- **Mobile first**: estilos base para telas pequenas; breakpoints com `@media (min-width: 48rem)` e similares para tablet/desktop.
- Assets exportados do Figma (logo, fundo do hero, foto, ícones de contato e login).

### Dificuldades e soluções

| Dificuldade | Solução |
|-------------|---------|
| Hero com triângulo verde + foto sobreposta | `position: relative` no bloco do hero; fundo (`BG.png`) no fluxo; foto (`foto.webp`) em `position: absolute` centralizada. |
| Texto duplicado na seção to-do da landing | `TodoBoard` com prop `embedded` para ocultar título/intro internos quando embutido na home. |
| Carrossel: bolinha errada ao voltar do último slide | Ref `scrollTargetRef` + ignorar eventos `scroll` durante navegação programática; sincronização com `scrollend` e timeout de fallback. |
| Imagem do hero pesada (~1 MB) | Geração de `foto.webp` redimensionada (script `npm run optimize:assets`) e `<picture>` com fallback PNG. |
| Tipografia do protótipo | **Montserrat** via Google Fonts com `display=swap` para não bloquear renderização. |

### Acessibilidade (WCAG)

- Landmarks: `<header>`, `<main id="conteudo-principal">`, `<section>`, `<article>`, `<footer>`.
- Link **“Pular para o conteúdo”** visível ao focar com teclado.
- Formulários com `<label>` associados; mensagens de erro com `role="alert"`.
- Carrossel: setas com `aria-label`, dots com `aria-selected`.
- Modal de login: `role="dialog"`, `aria-modal`, fechamento com **Esc**, **focus trap** no Tab.
- To-do: checkboxes com `aria-label`; botão delete com rótulo descritivo.

### Cross-browser

Uso de CSS amplamente suportado (`clip-path`, `scroll-snap`, flexbox). Recomenda-se validar manualmente em **Chrome, Safari, Firefox e Edge** antes da entrega final.

---

## Etapa 2 — Funcionalidades (React + Node)

### Autenticação

- Cadastro e login: `POST /api/auth/register` e `/login`.
- JWT em cookie **httpOnly** (`credentials: "include"` no `fetch`).
- Senhas com **bcrypt** no servidor.
- Páginas `/login` e `/cadastro` reutilizam `AuthPanel` (mesmo layout do modal de Sign in).

**Produção (front Vercel + API Render):** cookies com `SameSite=None; Secure` e `CLIENT_ORIGIN` apontando exatamente para a URL do front — necessário porque domínios são diferentes.

### To-do list

- Modelo `Task` com `userId`, `title`, `done`, `sortOrder`.
- CRUD em `/api/tasks`; reordenação em `PATCH /api/tasks/reorder`.
- Front: `@dnd-kit` só na lista **pendente**; ao marcar **done**, item vai para coluna “Done”.
- Edição: clique no título → input inline (Enter salva, Esc cancela).
- Delete: visível no **hover** (e com `:focus-within` para teclado).
- Lista na home só aparece **logado**; visitante é direcionado a entrar/cadastrar.

### Carrossel “good things”

- Setas, arraste horizontal (`scroll-snap`), indicadores e auto-play (pausa no hover).
- Imagens de placeholder (Unsplash) até substituição por assets finais do Figma, se desejado.

---

## Etapa 3 — E-mail de contato

- Rota `POST /api/contact` com validação de campos.
- **Nodemailer** + variáveis SMTP no servidor.
- Em **desenvolvimento** sem SMTP: mensagem registrada no **log da API** (facilita testar sem conta de e-mail).
- Em **produção**: SMTP obrigatório (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, etc.).

---

## Performance

- `loading="lazy"` em imagens abaixo da dobra; hero com `fetchpriority="high"` onde aplicável.
- WebP para foto do hero após otimização.
- Fontes com `preconnect` + `display=swap`.
- Build Vite com code-splitting padrão; dependências enxutas no runtime.

---

## Entrega

| Item | Onde |
|------|------|
| Código | Repositório Git (ver `ENTREGA.md`) |
| Site público | URL do front (Vercel) |
| API | URL do back (Render) |
| Este relatório | `PROCESSO.md` |

---

## O que ainda depende do desenvolvedor

1. **Deploy** no Render + Vercel e preencher URLs em `ENTREGA.md`.
2. **SMTP** real no painel do Render para o formulário de contato em produção.
3. **Revisão pixel-perfect** com o arquivo Figma oficial nos quatro navegadores.
4. Substituir imagens do carrossel por exports do layout, se a banca exigir fidelidade total às artes.

---

## Stack

- Front: React 19, React Router, Vite 8, @dnd-kit
- Back: Express, Prisma, PostgreSQL (Neon), JWT, Nodemailer
- Deploy sugerido: Vercel (client) + Render (server)
