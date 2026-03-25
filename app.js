const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Main pages
app.get('/', (req, res) => res.render('pages/index', { currentPage: 'home' }));
app.get('/onama', (req, res) => res.render('pages/onama', { currentPage: 'onama' }));
app.get('/skolanogometa', (req, res) => res.render('pages/skolanogometa', { currentPage: 'skola' }));
app.get('/vijesti', (req, res) => res.render('pages/vijesti', { currentPage: 'vijesti' }));

// Article pages
const articles = [
  'zelengaj-remi', 'pobjeda-spansko', 'infrastruktura',
  'najava-ilovac', 'intervju-skrinjaric', 'mladi-igraci'
];
articles.forEach(slug => {
  app.get(`/${slug}`, (req, res) => res.render(`articles/${slug}`, { currentPage: 'vijesti' }));
});

// Backward compatibility - redirect .html to clean URLs
app.get('/*.html', (req, res) => {
  const name = req.params[0];
  if (name === 'index') return res.redirect('/');
  res.redirect(`/${name}`);
});

app.listen(PORT, () => console.log(`NK Polet server running on http://localhost:${PORT}`));
