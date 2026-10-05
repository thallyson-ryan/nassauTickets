import { useState } from 'react';

const ATIVOS = ['CHAMADA', 'CHAMADA_NOVAMENTE', 'EM_ATENDIMENTO'];

export default function Atendente({ tickets, acoes }) {
  const [guiche, setGuiche] = useState(1);
  const atual = tickets.find((t) => t.guiche === guiche && ATIVOS.includes(t.estado));
  const aguardando = tickets.filter((t) => t.estado === 'AGUARDANDO').length;

  return (
    <section aria-labelledby="a-titulo">
      <h2 id="a-titulo">Terminal do atendente</h2>
      <label>
        Guichê{' '}
        <select value={guiche} onChange={(e) => setGuiche(Number(e.target.value))}>
          {[1, 2, 3, 4].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>
      <p>Na fila: {aguardando}</p>

      {!atual && (
        <button className="grande" disabled={aguardando === 0} onClick={() => acoes.chamar(guiche)}>
          Chamar próxima senha
        </button>
      )}

      {atual && (
        <div className="atual">
          <p>Senha <strong>{atual.numero}</strong> — {atual.estado}</p>
          {atual.estado !== 'EM_ATENDIMENTO' && (
            <>
              <button onClick={() => acoes.iniciar(atual.numero)}>Iniciar atendimento</button>{' '}
              <button onClick={() => acoes.chamarNovamente(atual, guiche)}>Chamar novamente</button>{' '}
            </>
          )}
          {atual.estado === 'CHAMADA_NOVAMENTE' && (
            <button onClick={() => acoes.naoCompareceu(atual.numero)}>Não compareceu</button>
          )}
          {atual.estado === 'EM_ATENDIMENTO' && (
            <button onClick={() => acoes.finalizar(atual.numero)}>Encerrar atendimento</button>
          )}
        </div>
      )}
    </section>
  );
}
