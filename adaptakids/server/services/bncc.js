// Referência resumida por componente curricular, usada apenas para orientar
// a IA sobre o foco pedagógico dos Anos Iniciais do Ensino Fundamental (BNCC).
// Fonte oficial e completa: https://basenacionalcomum.mec.gov.br/abase/#fundamental
const REFERENCIA_BNCC = {
  'Língua Portuguesa': 'Foco em leitura, escrita, oralidade e compreensão textual, com progressão da alfabetização (1º e 2º ano) para a produção textual mais autônoma (3º ao 5º ano).',
  'Matemática': 'Foco em números, operações, grandezas, medidas e resolução de problemas, com progressão da contagem e noções básicas para operações e frações.',
  'Ciências': 'Foco em vida, ambiente, corpo humano, matéria e energia, com abordagem investigativa e observação do mundo natural.',
  'História': 'Foco em identidade, tempo, memória e convivência social, com progressão do universo individual/familiar para o coletivo/comunitário.',
  'Geografia': 'Foco em lugar, paisagem, território e relações espaciais, com progressão do espaço vivido (casa, escola) para o espaço mais amplo (bairro, cidade).'
};

function contextoBNCC(disciplina, ano) {
  const base = REFERENCIA_BNCC[disciplina] || 'Foco em conteúdos do Ensino Fundamental I, adequados à faixa etária.';
  return `Ano escolar: ${ano}. Componente curricular: ${disciplina}. Referência BNCC (Anos Iniciais): ${base} Consulte a BNCC oficial em https://basenacionalcomum.mec.gov.br/abase/#fundamental para o detalhamento completo de habilidades e objetos de conhecimento.`;
}

module.exports = { contextoBNCC };
