const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { adaptarMaterial } = require('../services/aiAdapter');

function gerarTitulo(texto) {
  const limpo = texto.replace(/\s+/g, ' ').trim();
  const palavras = limpo.split(' ').slice(0, 8).join(' ');
  return palavras.length < limpo.length ? palavras + '…' : palavras;
}

router.post('/', requireLogin, async (req, res) => {
  const { texto, disciplina, ano, nivel } = req.body || {};

  if (!texto || !texto.trim()) {
    return res.status(400).json({ erro: 'Cole ou digite o material que deseja adaptar.' });
  }
  if (!disciplina || disciplina === 'Selecione') {
    return res.status(400).json({ erro: 'Selecione a disciplina.' });
  }
  if (!ano || ano === 'Selecione o ano') {
    return res.status(400).json({ erro: 'Selecione o ano escolar.' });
  }

  const nivelFinal = nivel || 'Padrão (TEA nível 1)';

  try {
    const textoAdaptado = await adaptarMaterial({
      texto: texto.trim(),
      disciplina,
      ano,
      nivel: nivelFinal
    });

    const titulo = gerarTitulo(texto);

    const info = db.prepare(`
      INSERT INTO adaptacoes (usuario_id, titulo, disciplina, ano, nivel, texto_original, texto_adaptado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.session.usuarioId, titulo, disciplina, ano, nivelFinal, texto.trim(), textoAdaptado);

    const adaptacao = db.prepare('SELECT * FROM adaptacoes WHERE id = ?').get(info.lastInsertRowid);
    res.json({ ok: true, adaptacao });
  } catch (err) {
    console.error('Erro ao gerar adaptação:', err);
    res.status(502).json({ erro: err.message || 'Não foi possível gerar a adaptação no momento. Tente novamente.' });
  }
});

router.get('/', requireLogin, (req, res) => {
  const { busca, disciplina, ano, favoritos, limite } = req.query;

  let sql = 'SELECT * FROM adaptacoes WHERE usuario_id = ?';
  const params = [req.session.usuarioId];

  if (busca) {
    sql += ' AND (titulo LIKE ? OR disciplina LIKE ?)';
    params.push(`%${busca}%`, `%${busca}%`);
  }
  if (disciplina && !disciplina.startsWith('Todas')) {
    sql += ' AND disciplina = ?';
    params.push(disciplina);
  }
  if (ano && !ano.startsWith('Todos')) {
    sql += ' AND ano = ?';
    params.push(ano);
  }
  if (favoritos === '1') {
    sql += ' AND favorito = 1';
  }

  sql += ' ORDER BY criado_em DESC';
  if (limite) {
    sql += ' LIMIT ?';
    params.push(Number(limite));
  }

  const linhas = db.prepare(sql).all(...params);
  res.json({ adaptacoes: linhas });
});

router.get('/:id', requireLogin, (req, res) => {
  const adaptacao = db.prepare('SELECT * FROM adaptacoes WHERE id = ? AND usuario_id = ?')
    .get(req.params.id, req.session.usuarioId);
  if (!adaptacao) return res.status(404).json({ erro: 'Adaptação não encontrada.' });
  res.json({ adaptacao });
});

router.post('/:id/favorito', requireLogin, (req, res) => {
  const adaptacao = db.prepare('SELECT * FROM adaptacoes WHERE id = ? AND usuario_id = ?')
    .get(req.params.id, req.session.usuarioId);
  if (!adaptacao) return res.status(404).json({ erro: 'Adaptação não encontrada.' });

  const novoValor = adaptacao.favorito ? 0 : 1;
  db.prepare('UPDATE adaptacoes SET favorito = ? WHERE id = ?').run(novoValor, adaptacao.id);
  res.json({ ok: true, favorito: !!novoValor });
});

module.exports = router;
