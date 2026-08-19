const crypto = require('crypto');

// Usa scrypt (nativo do Node, sem dependência externa) para gerar hash de senha.
function hashPassword(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(senha, armazenado) {
  const [salt, hash] = (armazenado || '').split(':');
  if (!salt || !hash) return false;
  const hashInformado = crypto.scryptSync(senha, salt, 64);
  const hashArmazenado = Buffer.from(hash, 'hex');
  if (hashInformado.length !== hashArmazenado.length) return false;
  return crypto.timingSafeEqual(hashInformado, hashArmazenado);
}

module.exports = { hashPassword, verifyPassword };
