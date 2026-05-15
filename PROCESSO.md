# Processo — Desafio Coopers

Texto para a banca: como foi desenvolver o projeto, o que travou e como resolvi.

## Visão geral

Montei um monorepo com **Vite + React** na pasta `client` e **Express + Prisma + PostgreSQL (Neon)** na `server`. A ideia era ter a landing o mais fiel possível ao Figma (mobile first) numa página só, e ligar to-do, login e formulário de contato numa API única.

## Front e layout

Concentrei o visual da marca no wrapper `.coopers` e no `landing.css`, para não misturar com outras rotas. O layout começa no mobile e só depois ganha breakpoints (`min-width` em rem).

O hero foi o trecho mais trabalhoso: triângulo verde + foto no meio. Usei `position: relative` no bloco, fundo no fluxo e foto em `absolute` centralizada. A foto original passava de 1 MB; gerei `foto.webp` menor e `<picture>` com fallback no PNG.

Na seção to-do da home o texto do board repetia o título. Criei a prop `embedded` no `TodoBoard` para esconder heading e intro quando ele está embutido na landing.

O carrossel “good things” usa scroll horizontal com snap, setas e bolinhas. A bolinha desincronizava ao voltar do último slide; usei um ref para marcar scroll programático e tratei `scrollend` com timeout de segurança.

Tipografia: **Montserrat** via Google Fonts com `display=swap`.

### Acessibilidade

Tentei seguir o básico do WCAG: `main` com id para skip link, labels nos forms, `aria-*` no carrossel e no modal. No modal de login coloquei trap de foco (Tab não sai do diálogo) e Esc fecha.

## Back, auth e to-do

Login e cadastro usam `fetch` com `credentials: "include"`. O JWT fica em cookie **httpOnly**. Senha com hash **bcrypt**. `/login` e `/cadastro` reaproveitam o `AuthPanel` do modal.

No deploy **Vercel + Render** os domínios são diferentes: CORS com a URL exata do front (`CLIENT_ORIGIN`) e cookies `SameSite=None` + `Secure` em produção.

O modelo `Task` tem `userId`. Reordenação em `PATCH /api/tasks/reorder`. No front, **@dnd-kit** só nas pendentes. Após deploy notei `/app` com fundo branco + dark mode do SO deixava os cards pouco legíveis; passei a redirecionar pós-login para a home com `#todo-list` e limitei o tema escuro da to-do à faixa preta da landing.

## Contato

`POST /api/contact` com **Nodemailer**. Localmente, sem SMTP, a mensagem cai no log do servidor. Em produção precisa configurar SMTP no painel.

## Performance

Lazy nas imagens abaixo da dobra, WebP no hero, preconnect nas fontes.

## Deploy

API no **Render** com pasta `server`. **Prisma** precisava estar em `dependencies` por causa do `NODE_ENV=production`. Erro de build com Prisma: `DATABASE_URL` tinha que começar com `postgresql://`. Front na **Vercel** com root `client` e `VITE_API_URL`. Cuidado com domínios: um hostname antigo ainda apontava para outro projeto.

Links finais estão no `ENTREGA.md`.

## Pendências opcionais

SMTP completo no Render; imagens do carrossel 100% do Figma; teste nos quatro navegadores.

## Stack

React 19, React Router, Vite, @dnd-kit — Express, Prisma, Neon, JWT, Nodemailer.
