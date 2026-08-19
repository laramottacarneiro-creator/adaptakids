require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const perfilRoutes = require('./routes/perfil');
const adaptacoesRoutes = require('./routes/adaptacoes');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..'); // pasta com os .html/.css do site

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'adaptakids-dev-secret-troque-isso',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
  }
}));

// Arquivos enviados pelos usuários (fotos de perfil)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API
app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/adaptacoes', adaptacoesRoutes);

// Site estático (index.html, login.html, styles.css, etc.)
app.use(express.static(PUBLIC_DIR));

// Tratamento de erros não capturados nas rotas
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`AdaptaKids rodando em http://localhost:${PORT}`);
});
