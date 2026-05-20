const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || 'https://poletsvetaklara.com').replace(/\/+$/, '');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Globalna varijabla dostupna svim predlošcima (canonical, og:url, sitemap...)
app.locals.siteUrl = SITE_URL;

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Glavne stranice — ruta, predložak i SEO meta podaci
const pages = [
  { route: '/', view: 'pages/index', currentPage: 'home',
    title: 'Škola nogometa — NK Polet Sveta Klara',
    description: 'Upiši dijete u školu nogometa NK Polet Sveta Klara. Profesionalan pristup, stručan trenerski tim i tradicija od 1948.' },
  { route: '/seniori', view: 'pages/seniori', currentPage: 'seniori',
    title: 'Seniorska momčad — NK Polet Sveta Klara',
    description: 'Seniorska momčad NK Polet Sveta Klara — igrači, raspored utakmica i rezultati u tekućoj sezoni.' },
  { route: '/fizio', view: 'pages/fizio', currentPage: 'fizio',
    title: 'Fizioterapija Restart — NK Polet Sveta Klara',
    description: 'Centar za fizioterapiju i rehabilitaciju Restart — partner NK Poleta. Besplatan pregled i terapija za igrače, 20% popusta za roditelje.' },
  { route: '/mladi-uzrasti', view: 'pages/mladi-uzrasti', currentPage: 'mladi',
    title: 'Mladi uzrasti — NK Polet Sveta Klara',
    description: 'Tablice i popisi igrača svih mlađih generacija NK Poleta. Podatci iz HNS Semafora za sezonu 2025/26.' },
  { route: '/onama', view: 'pages/onama', currentPage: 'onama',
    title: 'O nama — NK Polet Sveta Klara',
    description: 'Povijest, vizija i ljudi NK Poleta Sveta Klara — nogometnog kluba iz Novog Zagreba s tradicijom od 1948. godine.' },
  { route: '/skolanogometa', view: 'pages/skolanogometa', currentPage: 'skola',
    title: 'Škola nogometa — NK Polet Sveta Klara',
    description: 'Škola nogometa NK Polet Sveta Klara — upis djece, treninzi i stručan trenerski tim u sigurnom i profesionalnom okruženju.' },
  { route: '/vijesti', view: 'pages/vijesti', currentPage: 'vijesti',
    title: 'Vijesti — NK Polet Sveta Klara',
    description: 'Najnovije vijesti, najave utakmica, rezultati i intervjui iz NK Poleta Sveta Klara.' }
];

// Članci (vijesti) — slug, naslov i SEO opis
const articles = [
  { slug: 'zelengaj-remi',
    title: 'NK Polet 1-1 NK Zelengaj 1948 — NK Polet Sveta Klara',
    description: 'Uzbudljiva utakmica na Sportskom centru Polet završila je pravednim remijem 1-1 protiv NK Zelengaja 1948.' },
  { slug: 'pobjeda-spansko',
    title: 'NK Polet 3-1 NK Špansko — NK Polet Sveta Klara',
    description: 'NK Polet odigrao je jednu od najimpresivnijih utakmica sezone i pred svojim navijačima pobijedio NK Špansko 3-1.' },
  { slug: 'infrastruktura',
    title: 'Ulaganje u infrastrukturu — NK Polet Sveta Klara',
    description: 'Sportski centar Polet prolazi kroz značajnu obnovu koja će omogućiti bolje uvjete za sve ekipe kluba i navijače.' },
  { slug: 'najava-ilovac',
    title: 'Najava: NK Ilovac vs NK Polet — NK Polet Sveta Klara',
    description: 'Najava prvenstvene utakmice NK Ilovac — NK Polet Sveta Klara, 28. ožujka 2026. s početkom u 16:00.' },
  { slug: 'intervju-skrinjaric',
    title: 'Intervju: trener Sandro Jurić — NK Polet Sveta Klara',
    description: 'Intervju s trenerom Sandrom Jurićem o radu, predanosti i viziji razvoja momčadi NK Poleta Sveta Klara.' },
  { slug: 'mladi-igraci',
    title: 'Mladi igrači — budućnost kluba — NK Polet Sveta Klara',
    description: 'Mladi igrači budućnost su NK Poleta Sveta Klara — klub se ističe po brojnim talentima i radu s mladim generacijama.' }
];

// Rute za glavne stranice
pages.forEach(p => {
  app.get(p.route, (req, res) => res.render(p.view, {
    currentPage: p.currentPage,
    seo: { title: p.title, description: p.description, path: p.route, type: 'website' }
  }));
});

// Rute za članke
articles.forEach(a => {
  app.get(`/${a.slug}`, (req, res) => res.render(`articles/${a.slug}`, {
    currentPage: 'vijesti',
    seo: { title: a.title, description: a.description, path: `/${a.slug}`, type: 'article' }
  }));
});

// robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
  );
});

// sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const routes = [...pages.map(p => p.route), ...articles.map(a => `/${a.slug}`)];
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes.map(r => {
    const priority = r === '/' ? '1.0' : '0.7';
    return `  <url>\n    <loc>${SITE_URL}${r}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  }).join('\n');
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
});

// Backward compatibility - trajni redirect .html na čiste URL-ove
app.get('/*.html', (req, res) => {
  const name = req.params[0];
  if (name === 'index') return res.redirect(301, '/');
  res.redirect(301, `/${name}`);
});

app.listen(PORT, () => console.log(`NK Polet server running on http://localhost:${PORT}`));
