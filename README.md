# Ótica Real Santa Rita — Loja 1

Site estático (HTML + CSS + JS puro). Não precisa de build.

## Como abrir
Abra `index.html` no navegador. Para publicar, envie toda a pasta para qualquer hospedagem estática
(Netlify, Vercel, GitHub Pages, Cloudflare Pages ou servidor comum).

## Estrutura
- `index.html` — conteúdo e SEO (inclui dados estruturados com endereço, telefone e nota 4,9 / 53 avaliações)
- `css/style.css` — grid de 12 colunas (máx. 1360px), temas claro/escuro, responsivo
- `js/main.js` — tema com transição de lente, cursor, luz no fundo, scroll, menu
- `assets/img/` — fotos enviadas, convertidas para WebP

## Como editar
- Outras redes sociais: adicione um `<li>` na lista `.social` do rodapé.
- Cores: variáveis no topo de `css/style.css` (`[data-theme="light"]` e `[data-theme="dark"]`).
- Fontes (Bodoni Moda e Hanken Grotesk) carregam do Google Fonts; sem internet, usa Didot/Georgia e fontes do sistema.
