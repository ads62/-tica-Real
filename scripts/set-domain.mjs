// Uso: node scripts/set-domain.mjs https://www.seudominio.com.br
// Troca {{SITE_URL}} (canonical, Open Graph, sitemap, robots, schema.org) pelo domínio real.
import { readFileSync, writeFileSync } from 'node:fs';
const url = (process.argv[2] ?? '').replace(/\/+$/, '');
if (!/^https?:\/\/[^/]+/.test(url)) { console.error('Informe o domínio completo, ex.: https://www.oticareal.com.br'); process.exit(1); }
for (const f of ['index.html', 'robots.txt', 'sitemap.xml']) {
  writeFileSync(f, readFileSync(f, 'utf8').replaceAll('{{SITE_URL}}', url));
  console.log('ok', f);
}
