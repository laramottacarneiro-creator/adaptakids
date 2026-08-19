/* ==========================================================================
   AdaptaKids — Cliente de API (usado por todas as páginas do app)
   ========================================================================== */

const API_BASE = '/api';

async function apiRequest(caminho, opcoes = {}) {
  const resposta = await fetch(API_BASE + caminho, {
    credentials: 'same-origin',
    headers: opcoes.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...opcoes
  });

  let dados = null;
  try { dados = await resposta.json(); } catch (err) { /* resposta sem corpo JSON */ }

  if (!resposta.ok) {
    const erro = new Error((dados && dados.erro) || 'Ocorreu um erro. Tente novamente.');
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

/** Garante que o usuário está logado; redireciona para login.html se não estiver. */
async function exigirLogin() {
  try {
    const { usuario } = await apiRequest('/auth/me');
    return usuario;
  } catch (err) {
    window.location.href = 'login.html';
    return null;
  }
}

function iniciaisDoNome(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0] ? partes[0][0] : '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

/** Aplica os dados do usuário logado ao avatar e ao primeiro nome na topbar, se existirem na página. */
function hidratarUsuarioNaTopbar(usuario) {
  const avatares = document.querySelectorAll('.avatar');
  avatares.forEach(av => {
    if (usuario.foto_path) {
      av.style.backgroundImage = `url('${usuario.foto_path}')`;
      av.style.backgroundSize = 'cover';
      av.style.backgroundPosition = 'center';
      av.textContent = '';
    } else {
      av.textContent = iniciaisDoNome(usuario.nome);
    }
  });

  const saudacoes = document.querySelectorAll('[data-primeiro-nome]');
  const primeiroNome = usuario.nome.trim().split(/\s+/)[0];
  saudacoes.forEach(el => { el.textContent = primeiroNome; });
}

function formatarData(dataSqlite) {
  // dataSqlite vem como "YYYY-MM-DD HH:MM:SS" em UTC (datetime('now') do SQLite)
  const iso = dataSqlite.replace(' ', 'T') + 'Z';
  const data = new Date(iso);
  if (isNaN(data.getTime())) return dataSqlite;
  return data.toLocaleDateString('pt-BR');
}

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/* Encerra a sessão e volta para a página inicial pública */
async function sair(event) {
  if (event) event.preventDefault();
  try { await apiRequest('/auth/logout', { method: 'POST' }); } catch (err) { /* segue mesmo com erro */ }
  window.location.href = 'index.html';
}

/* Liga automaticamente qualquer link "Sair" que tenha data-logout */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-logout]').forEach(el => {
    el.addEventListener('click', sair);
  });
});
