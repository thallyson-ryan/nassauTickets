import { useEffect, useRef } from 'react';
import useAtualizacao from '../hooks/useAtualizacao.js';
import { ultimasChamadas } from '../services/api.js';
import { TIPOS } from '../services/constantes.js';
import { falarChamada } from '../utils/audio.js';
import AvisoConexao from './AvisoConexao.jsx';

const CHAVE_CACHE = 'nassauTickets.painel';

function lerCache() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CACHE)) || [];
  } catch {
    return [];
  }
}

// Busca as 5 últimas chamadas e guarda uma cópia local para continuar
// exibindo algo se o backend cair (mesmo após recarregar a página).
async function buscarComCache() {
  const lista = await ultimasChamadas();
  try { localStorage.setItem(CHAVE_CACHE, JSON.stringify(lista)); } catch { /* sem cache */ }
  return lista;
}

// Cada chamada é identificada pela senha + horário da chamada; "Chamar novamente"
// muda o horário e por isso é anunciada outra vez, precedida de "Última chamada".
const chaveChamada = (s) => `${s.numero}|${s.chamada_em}`;

export default function Painel() {
  const { dados, erro, atualizadoEm } = useAtualizacao(buscarComCache, 3000);
  const chamadas = dados ?? lerCache();
  const anunciadas = useRef(null); // chamadas já anunciadas (ou já existentes ao abrir o painel)

  useEffect(() => {
    if (!dados) return;
    if (anunciadas.current === null) {
      // Primeira leitura: não anuncia chamadas antigas
      anunciadas.current = new Set(dados.map(chaveChamada));
      return;
    }
    const novas = dados.filter((s) => !anunciadas.current.has(chaveChamada(s))).reverse(); // mais antiga primeiro
    novas.forEach((s) => {
      anunciadas.current.add(chaveChamada(s));
      falarChamada(s, s.guiche, Boolean(s.repetida));
    });
  }, [dados]);

  return (
    <section aria-labelledby="p-titulo">
      <h2 id="p-titulo">Últimas senhas chamadas</h2>
      <AvisoConexao erro={erro} atualizadoEm={atualizadoEm} />
      {chamadas.length === 0 ? (
        <p>Nenhuma senha chamada ainda.</p>
      ) : (
        <ol className="painel" aria-live="polite">
          {chamadas.map((s, i) => (
            <li key={s.numero} className={i === 0 ? 'destaque' : ''}>
              <span>
                {s.numero}
                <small>{TIPOS[s.tipo]}{s.repetida ? ' — última chamada' : ''}</small>
              </span>
              <span>Guichê {s.guiche}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
