import { useState } from 'react';
import useAtualizacao from '../hooks/useAtualizacao.js';
import * as api from '../services/api.js';
import { ESTADOS, TIPOS } from '../services/constantes.js';
import AvisoConexao from './AvisoConexao.jsx';

const GUICHES = [1, 2, 3, 4];
const CHAVE_GUICHE = 'nassauTickets.guiche';

function guicheSalvo() {
  try {
    return Number(localStorage.getItem(CHAVE_GUICHE)) || 1;
  } catch {
    return 1;
  }
}

export default function Atendente() {
  const [guiche, setGuiche] = useState(guicheSalvo);
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const { dados, erro, atualizadoEm, recarregar } = useAtualizacao(api.atendimentoAtual, 4000);

  const atual = dados?.atual;
  const aguardando = dados?.aguardando ?? 0;

  function trocarGuiche(e) {
    const g = Number(e.target.value);
    setGuiche(g);
    try { localStorage.setItem(CHAVE_GUICHE, String(g)); } catch { /* opcional */ }
  }

  // Executa uma ação na API, mostra o erro (se houver) e atualiza a tela
  async function executar(fn) {
    setOcupado(true);
    setMensagem('');
    try {
      await fn();
    } catch (e) {
      setMensagem(e.message);
    } finally {
      setOcupado(false);
      recarregar();
    }
  }

  const chamar = () => executar(async () => {
    const senha = await api.chamarProxima(guiche);
    if (!senha) setMensagem('Não há senhas na fila.');
  });

  // O áudio da chamada é reproduzido pelo painel
  const chamarNovamente = () => executar(() => api.chamarNovamente(atual.numero));

  return (
    <section aria-labelledby="a-titulo">
      <h2 id="a-titulo">Terminal do atendente</h2>
      <AvisoConexao erro={erro} atualizadoEm={atualizadoEm} />

      <div className="linha">
        <label>
          Guichê{' '}
          <select value={guiche} onChange={trocarGuiche} disabled={Boolean(atual)}>
            {GUICHES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <p>Na fila: <strong>{aguardando}</strong></p>
      </div>

      {mensagem && <p className="aviso" role="status">{mensagem}</p>}

      {!atual && (
        <button className="grande" disabled={ocupado || Boolean(erro)} onClick={chamar}>
          Chamar próxima senha
        </button>
      )}

      {atual && (
        <div className="atual">
          <p>
            Senha <strong className="senha">{atual.numero}</strong> ({TIPOS[atual.tipo]}) — guichê {atual.guiche}
            <br />
            Situação: <strong>{ESTADOS[atual.estado]}</strong>
          </p>
          <div className="botoes">
            {atual.estado !== 'EM_ATENDIMENTO' && (
              <button className="grande" disabled={ocupado}
                onClick={() => executar(() => api.iniciarAtendimento(atual.numero))}>
                Iniciar atendimento
              </button>
            )}
            {atual.estado === 'CHAMADA' && (
              <button disabled={ocupado} onClick={chamarNovamente}>Chamar novamente</button>
            )}
            {atual.estado === 'CHAMADA_NOVAMENTE' && (
              <button disabled={ocupado} onClick={() => executar(() => api.naoCompareceu(atual.numero))}>
                Não compareceu
              </button>
            )}
            {atual.estado === 'EM_ATENDIMENTO' && (
              <button className="grande" disabled={ocupado}
                onClick={() => executar(() => api.finalizarAtendimento(atual.numero))}>
                Encerrar atendimento
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
