/* ==========================================================================
   AdaptaKids — Favoritos (persistidos no backend, por conta de usuário)
   Depende de api.js (apiRequest) já carregado antes deste arquivo.
   ========================================================================== */

async function alternarFavorito(id, starEl) {
  try {
    const { favorito } = await apiRequest(`/adaptacoes/${id}/favorito`, { method: 'POST' });
    if (starEl) setStarState(starEl, favorito);
    return favorito;
  } catch (err) {
    alert(err.message || 'Não foi possível atualizar o favorito.');
    return null;
  }
}

function setStarState(starEl, ativo) {
  if (ativo) {
    starEl.classList.remove('inactive');
    starEl.setAttribute('fill', 'currentColor');
  } else {
    starEl.classList.add('inactive');
    starEl.setAttribute('fill', 'none');
  }
}
