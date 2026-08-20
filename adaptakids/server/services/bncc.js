// Referência à BNCC usada para orientar a IA na adaptação de materiais.
// Combina duas camadas:
//  1) Habilidades reais e específicas da BNCC (código + descrição oficial),
//     verificadas por ano/disciplina, para os anos em que temos fonte confiável.
//  2) Um resumo geral da área, usado como reforço/fallback quando não há
//     habilidades específicas cadastradas para aquele ano/disciplina.
// Fonte oficial e completa: https://basenacionalcomum.mec.gov.br/abase/#fundamental
//
// IMPORTANTE: as habilidades abaixo são um recorte (não a BNCC completa).
// Nunca são inventadas — cada uma reproduz o texto oficial de um código real.

const REFERENCIA_BNCC = {
  'Língua Portuguesa': 'Foco em leitura, escrita, oralidade e compreensão textual, com progressão da alfabetização (1º e 2º ano) para a produção textual mais autônoma (3º ao 5º ano).',
  'Matemática': 'Foco em números, operações, grandezas, medidas e resolução de problemas, com progressão da contagem e noções básicas para operações e frações.',
  'Ciências': 'Foco em vida, ambiente, corpo humano, matéria e energia, com abordagem investigativa e observação do mundo natural.',
  'História': 'Foco em identidade, tempo, memória e convivência social, com progressão do universo individual/familiar para o coletivo/comunitário.',
  'Geografia': 'Foco em lugar, paisagem, território e relações espaciais, com progressão do espaço vivido (casa, escola) para o espaço mais amplo (bairro, cidade).'
};

const HABILIDADES_BNCC = {
  'Língua Portuguesa': {
    '1º ano': [
      'EF01LP01 — Reconhecer que textos de diferentes gêneros são lidos e escritos da esquerda para a direita e de cima para baixo na página.',
      'EF01LP07 — Compreender as notações do sistema de escrita alfabética (segmentos sonoros e letras).',
      'EF01LP20 — Identificar e reproduzir, em listas, agendas, calendários, regras, avisos e convites, a formatação e diagramação específica de cada um desses gêneros.'
    ],
    '2º ano': [
      'EF02LP02 — Grafar palavras desconhecidas apoiando-se no som e na grafia de palavras familiares e/ou estáveis.',
      'EF02LP05 — Grafar corretamente palavras com marcas de nasalidade (m, n, sinal gráfico til).',
      'EF02LP13 — Planejar e produzir bilhetes e cartas, em meio impresso e/ou digital.'
    ],
    '3º ano': [
      'EF03LP09A — Ler e compreender cordéis, repentes, entre outros textos do campo artístico-literário, considerando a situação comunicativa, o tema/assunto, a estrutura composicional e o estilo do gênero.',
      'EF03LP11 — Ler e compreender, com autonomia, textos injuntivos instrucionais (receitas, instruções de jogos, regras).'
    ]
  },
  'Matemática': {
    '1º ano': [
      'EF01MA05 — Comparar números naturais de até duas ordens em situações cotidianas, com e sem suporte da reta numérica.',
      'EF01MA06 — Construir fatos básicos da adição e utilizá-los em procedimentos de cálculo para resolver problemas.',
      'EF01MA08 — Resolver e elaborar problemas de adição e de subtração, envolvendo números de até dois algarismos, com os significados de juntar, acrescentar, separar e retirar.'
    ],
    '2º ano': [
      'EF02MA01 — Comparar, ordenar e registrar números naturais (até a ordem de centenas) pela compreensão de características do sistema de numeração decimal (valor posicional e função do zero).',
      'EF02MA04 — Compor e decompor números naturais de três ou mais ordens, com suporte de material manipulável, por meio de diferentes adições.'
    ],
    '3º ano': [
      'EF03MA01 — Ler, escrever e comparar números naturais de até a ordem de unidade de milhar, estabelecendo relações entre os registros numéricos e em língua materna.',
      'EF03MA02 — Identificar características do sistema de numeração decimal, utilizando a composição e a decomposição de número natural de até quatro ordens.',
      'EF03MA03 — Construir e utilizar fatos básicos da adição, subtração e da multiplicação para o cálculo mental ou escrito.'
    ]
  },
  'Ciências': {
    '1º ano': [
      'EF01CI01 — Comparar características de diferentes materiais presentes em objetos de uso cotidiano, discutindo sua origem e os modos como são descartados.',
      'EF01CI02 — Localizar, nomear e representar graficamente (por meio de desenhos) partes do corpo humano e explicar suas funções.',
      'EF01CI03A — Identificar hábitos de higiene do corpo e discutir as razões pelas quais lavar as mãos, escovar os dentes e limpar olhos, nariz e orelhas são medidas de prevenção necessárias à saúde.'
    ],
    '2º ano': [
      'EF02CI01 — Identificar de que materiais os objetos utilizados no dia a dia são feitos (metal, madeira, vidro, entre outros) e como são utilizados.',
      'EF02CI04 — Observar e descrever características de plantas e animais (tamanho, forma, cor, fase da vida e local onde se desenvolvem) que fazem parte de seu cotidiano.',
      'EF02CI06 — Identificar as principais partes de uma planta (raiz, caule, folhas, flores e frutos) e a função desempenhada por cada uma delas.'
    ]
  },
  'História': {
    '1º ano': [
      'EF01HI01 — Identificar aspectos do seu crescimento por meio do registro das lembranças particulares ou de lembranças dos membros de sua família e/ou de sua comunidade.',
      'EF01HI02 — Identificar a relação entre as suas histórias e as histórias de sua família e de sua comunidade.',
      'EF01HI03 — Identificar, descrever e distinguir os seus papéis e responsabilidades relacionados à família, à escola e à comunidade.'
    ]
  },
  'Geografia': {
    '1º ano': [
      'EF01GE01 — Observar e descrever características de seus lugares de vivência (moradia, escola, bairro, rua, entre outros) e identificar semelhanças e diferenças entre esses lugares.',
      'EF01GE02 — Identificar semelhanças e diferenças entre jogos e brincadeiras de diferentes épocas e lugares.',
      'EF01GE09 — Utilizar e elaborar mapas simples para localizar elementos do local de vivência, considerando referenciais espaciais (frente e atrás, esquerda e direita, em cima e embaixo, dentro e fora).'
    ]
  }
};

function contextoBNCC(disciplina, ano) {
  const base = REFERENCIA_BNCC[disciplina] || 'Foco em conteúdos do Ensino Fundamental I, adequados à faixa etária.';
  const habilidades = HABILIDADES_BNCC[disciplina]?.[ano];

  let texto = `Ano escolar: ${ano}. Componente curricular: ${disciplina}. Referência BNCC (Anos Iniciais): ${base}`;

  if (habilidades && habilidades.length) {
    texto += `\n\nHabilidades específicas da BNCC para ${disciplina} — ${ano} (use como referência do que é esperado nesse ano, sem se limitar apenas a elas):\n`;
    texto += habilidades.map(h => `- ${h}`).join('\n');
  }

  texto += `\n\nConsulte a BNCC oficial em https://basenacionalcomum.mec.gov.br/abase/#fundamental para o detalhamento completo de habilidades e objetos de conhecimento.`;
  return texto;
}

module.exports = { contextoBNCC };
