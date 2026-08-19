const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword, verifyPassword } = require('../services/senha');

router.post('/cadastro', (req, res) => {
  const { nome, email, senha, confirmar } = req.body || {};

  if (!nome || !nome.trim() || !email || !email.trim() || !senha || !confirmar) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }
  if (senha !== confirmar) {
    return res.status(400).json({ erro: 'As senhas não coincidem.' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  const emailNormalizado = email.toLowerCase().trim();
  const existente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(emailNormalizado);
  if (existente) {
    return res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' });
  }

  const senha_hash = hashPassword(senha);
  const info = db.prepare(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)'
  ).run(nome.trim(), emailNormalizado, senha_hash);

  req.session.usuarioId = info.lastInsertRowid;
  res.json({
    ok: true,
    usuario: { id: info.lastInsertRowid, nome: nome.trim(), email: emailNormalizado, foto_path: null }
  });
});

router.post('/login', (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email.toLowerCase().trim());
  if (!usuario || !verifyPassword(senha, usuario.senha_hash)) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  req.session.usuarioId = usuario.id;
  res.json({
    ok: true,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, foto_path: usuario.foto_path }
  });
});

router.post('/logout', (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session || !req.session.usuarioId) {
    return res.status(401).json({ erro: 'Não autenticado.' });
  }
  const usuario = db.prepare('SELECT id, nome, email, foto_path FROM usuarios WHERE id = ?')
    .get(req.session.usuarioId);
  if (!usuario) return res.status(401).json({ erro: 'Não autenticado.' });
  res.json({ usuario });
});

module.exports = router;
