const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { hashPassword } = require('../services/senha');

const uploadDir = path.join(__dirname, '..', 'uploads', 'perfil');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, `usuario-${req.session.usuarioId}-${Date.now()}.png`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/png') {
      return cb(new Error('Apenas arquivos no formato PNG são permitidos.'));
    }
    cb(null, true);
  }
});

router.put('/', requireLogin, (req, res) => {
  const { nome, email, senha } = req.body || {};
  if (!nome || !nome.trim() || !email || !email.trim()) {
    return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios.' });
  }

  const emailNormalizado = email.toLowerCase().trim();
  const outraConta = db.prepare('SELECT id FROM usuarios WHERE email = ? AND id != ?')
    .get(emailNormalizado, req.session.usuarioId);
  if (outraConta) {
    return res.status(409).json({ erro: 'Este e-mail já está em uso por outra conta.' });
  }

  if (senha && senha.trim()) {
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }
    db.prepare('UPDATE usuarios SET nome = ?, email = ?, senha_hash = ? WHERE id = ?')
      .run(nome.trim(), emailNormalizado, hashPassword(senha), req.session.usuarioId);
  } else {
    db.prepare('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?')
      .run(nome.trim(), emailNormalizado, req.session.usuarioId);
  }

  const usuario = db.prepare('SELECT id, nome, email, foto_path FROM usuarios WHERE id = ?')
    .get(req.session.usuarioId);
  res.json({ ok: true, usuario });
});

router.post('/foto', requireLogin, (req, res) => {
  upload.single('foto')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ erro: err.message || 'Não foi possível enviar a foto.' });
    }
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const anterior = db.prepare('SELECT foto_path FROM usuarios WHERE id = ?').get(req.session.usuarioId);
    if (anterior && anterior.foto_path) {
      const caminhoAntigo = path.join(__dirname, '..', anterior.foto_path);
      fs.unlink(caminhoAntigo, () => {});
    }

    const fotoPath = `/uploads/perfil/${req.file.filename}`;
    db.prepare('UPDATE usuarios SET foto_path = ? WHERE id = ?').run(fotoPath, req.session.usuarioId);
    res.json({ ok: true, foto_path: fotoPath });
  });
});

module.exports = router;
