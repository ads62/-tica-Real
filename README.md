# Ótica Real Santa Rita — site

Site estático (HTML + CSS + JS modular, GSAP local). Sem build: publique a pasta como está (Hostinger, Netlify, Vercel, GitHub Pages…).

## Antes de publicar
1. `node scripts/set-domain.mjs https://SEU-DOMINIO` — grava o domínio no canonical, Open Graph, sitemap, robots e schema.org.
2. Horários de funcionamento: ainda não informados. Adicionar em `index.html` (seção `#lojas`, comentário "Horários") e, se quiser, em `openingHours` no JSON-LD.
3. Links das publicações do Instagram: em `index.html` (seção `#instagram`) troque o `href` de cada `.post` pelo link `instagram.com/p/...`.

## Onde editar
- `js/config.js` — telefones/WhatsApp, endereços, assuntos das mensagens, tempo da vitrine do hero.
- `index.html` — vitrine (`<ul id="grid">`: copie um `<li class="tile">`), textos, lojas.
- `#promo` (topo) — campanha Black Friday; `data-until` esconde a faixa sozinha após 09/11/2026.
- `css/style.css` — paleta em `:root`.

## Observações
- Imagens dos óculos do hero: PNGs transparentes originais (apenas recortados fora do texto embutido nos arquivos).
- Notas do Google (4,9 e 5,0) e depoimentos são das páginas públicas do Google Maps — atualizar quando mudarem.
- Instagram: sem scraping. Para feed automático use a API oficial (Instagram Graph API) ou embeds oficiais.
