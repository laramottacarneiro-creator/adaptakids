const { contextoBNCC } = require('./bncc');

/**
 * Adapta o material REAL enviado pelo usuário.
 * Se houver uma chave de API de IA configurada (.env), usa o provedor real.
 * Caso contrário, cai no modo local (regras simples), que ainda assim
 * processa o texto real enviado — nunca inventa um assunto novo.
 */
async function adaptarMaterial({ texto, disciplina, ano, nivel }) {
  const provider = process.env.AI_PROVIDER;
  const apiKey = process.env.AI_API_KEY;

  if (provider && apiKey) {
    return adaptarComAPI({ texto, disciplina, ano, nivel, provider, apiKey });
  }

  return adaptarComRegrasLocais({ texto, nivel });
}

async function adaptarComAPI({ texto, disciplina, ano, nivel, provider, apiKey }) {
  const contexto = contextoBNCC(disciplina, ano);
  const prompt = montarPrompt({ texto, nivel, contexto });

  if (provider === 'gemini') {
    const modelo = process.env.AI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => '');
      throw new Error(`A API de IA retornou um erro (${resposta.status}). ${detalhe}`.trim());
    }

    const dados = await resposta.json();
    const saida = dados?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!saida || !saida.trim()) {
      throw new Error('A API de IA não retornou um resultado válido para este material.');
    }
    return saida.trim();
  }

  throw new Error(`Provedor de IA "${provider}" ainda não está implementado. Use "gemini" ou configure um novo provedor em services/aiAdapter.js.`);
}

function montarPrompt({ texto, nivel, contexto }) {
  return [
    'Você é um assistente que adapta materiais didáticos do Ensino Fundamental I para crianças com Transtorno do Espectro Autista (TEA) nível 1 de suporte.',
    contexto,
    `Nível de adaptação solicitado: ${nivel}.`,
    'Regras obrigatórias: preserve o assunto e o objetivo pedagógico do material original; use frases curtas, linguagem direta e concreta; evite ambiguidade, ironia e figuras de linguagem; organize o conteúdo em tópicos quando isso ajudar a compreensão; não invente informações, dados ou exemplos que não estejam relacionados ao material enviado; se o material não tiver informação suficiente para uma boa adaptação, diga isso claramente em vez de inventar conteúdo.',
    'Material original enviado pelo usuário:',
    texto,
    'Responda apenas com o material adaptado, sem comentários adicionais antes ou depois.'
  ].join('\n\n');
}

// ---------------------------------------------------------------------------
// Modo local (sem API configurada): simplificação por regras sobre o texto
// real enviado. Serve para o sistema ficar funcional imediatamente; assim
// que uma chave de API for definida em server/.env, esse modo deixa de ser
// usado automaticamente.
// ---------------------------------------------------------------------------
function adaptarComRegrasLocais({ texto, nivel }) {
  const frases = texto
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const linhas = [];

  frases.forEach(fraseOriginal => {
    const frase = fraseOriginal.trim();
    const partes = frase.split(/,\s+/).filter(Boolean);

    if (partes.length > 2 && nivel !== 'Avançado') {
      const introducao = partes[0].trim();
      linhas.push(introducao.endsWith('.') || introducao.endsWith(':') ? introducao : introducao + ':');
      partes.slice(1).forEach(parte => {
        const limpo = parte.trim().replace(/\.$/, '');
        if (limpo) linhas.push('- ' + limpo.charAt(0).toUpperCase() + limpo.slice(1));
      });
    } else {
      linhas.push(frase);
    }
  });

  const aviso = 'Aviso: esta adaptação foi gerada localmente por regras simples de simplificação de texto, pois nenhuma chave de API de IA está configurada em server/.env (AI_PROVIDER e AI_API_KEY). Configure esses valores para usar um modelo de IA real e obter adaptações mais completas.';

  return linhas.join('\n') + '\n\n[' + aviso + ']';
}

module.exports = { adaptarMaterial };
