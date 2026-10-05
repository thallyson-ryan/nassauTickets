// Simula o Agente Sistema (AS) em memória. Na fase 2 será trocado por chamadas à API REST.
export const TIPOS = { SP: 'Prioritária', SE: 'Exames', SG: 'Geral' };

const pad = (n, l = 2) => String(n).padStart(l, '0');

// Formato YYMMDD-PPSQ, ex.: 260504-SP001
export function gerarNumero(tipo, seq, d = new Date()) {
  return `${pad(d.getFullYear() % 100)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${tipo}${pad(seq, 3)}`;
}

export const estadoInicial = () => ({
  tickets: [],
  seq: { SP: 0, SE: 0, SG: 0 },
  proximaEhSP: true,
});

export function emitir(s, tipo) {
  const seq = s.seq[tipo] + 1;
  const ticket = {
    numero: gerarNumero(tipo, seq),
    tipo,
    estado: 'AGUARDANDO', // EMITIDA -> AGUARDANDO ocorre na própria emissão
    emitidaEm: new Date().toISOString(),
    guiche: null,
    chamadas: [],
  };
  return { ...s, seq: { ...s.seq, [tipo]: seq }, tickets: [...s.tickets, ticket] };
}

// Alterna SP / (SE ou SG). Se a fila da vez estiver vazia, usa a próxima prioridade.
export function escolherProximo(s) {
  const ordem = s.proximaEhSP ? ['SP', 'SE', 'SG'] : ['SE', 'SG', 'SP'];
  for (const tipo of ordem) {
    const t = s.tickets.find((x) => x.tipo === tipo && x.estado === 'AGUARDANDO');
    if (t) return t;
  }
  return null;
}

const atualizar = (s, numero, mudar) => ({
  ...s,
  tickets: s.tickets.map((t) => (t.numero === numero ? { ...t, ...mudar(t) } : t)),
});

export function chamarProximo(s, guiche) {
  const t = escolherProximo(s);
  if (!t) return s;
  const novo = atualizar(s, t.numero, (x) => ({
    estado: 'CHAMADA',
    guiche,
    chamadas: [...x.chamadas, new Date().toISOString()],
  }));
  return { ...novo, proximaEhSP: t.tipo !== 'SP' };
}

// 1ª repetição -> CHAMADA_NOVAMENTE; sem comparecimento após a 2ª chamada -> NAO_COMPARECEU
export function chamarNovamente(s, numero) {
  return atualizar(s, numero, (t) =>
    t.estado === 'CHAMADA'
      ? { estado: 'CHAMADA_NOVAMENTE', chamadas: [...t.chamadas, new Date().toISOString()] }
      : {}
  );
}

export const naoCompareceu = (s, numero) => atualizar(s, numero, () => ({ estado: 'NAO_COMPARECEU' }));
export const iniciarAtendimento = (s, numero) =>
  atualizar(s, numero, () => ({ estado: 'EM_ATENDIMENTO', inicioEm: new Date().toISOString() }));
export const finalizarAtendimento = (s, numero) =>
  atualizar(s, numero, () => ({ estado: 'ATENDIDA', fimEm: new Date().toISOString() }));
