function requireLogin(req, res, next) {
  if (!req.session || !req.session.usuarioId) {
    return res.status(401).json({ erro: 'Não autenticado.' });
  }
  next();
}

module.exports = { requireLogin };
