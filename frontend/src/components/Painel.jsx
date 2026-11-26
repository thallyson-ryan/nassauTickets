import { useEffect, useRef, useState } from 'react';
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

// Som ligado por padrão; só fica desligado se alguém desligou neste navegador
const CHAVE_SOM = 'nassauTickets.som';
function lerPreferenciaSom() {
  try {
    return localStorage.getItem(CHAVE_SOM) !== 'desligado';
  } catch {
    return true;
  }
}
function salvarPreferenciaSom(ativo) {
  try { localStorage.setItem(CHAVE_SOM, ativo ? 'ligado' : 'desligado'); } catch { /* opcional */ }
}
// navigator.userActivation indica se a página já recebeu um clique (Chrome/Edge)
const paginaJaClicada = () => navigator.userActivation?.hasBeenActive ?? true;

// Cada chamada é identificada pela senha + número de ordem da chamada; "Chamar novamente"
// gera um novo número e por isso é anunciada outra vez, precedida de "Última chamada".
const chaveChamada = (s) => `${s.numero}|${s.ordem ?? s.chamada_em}`;

export default function Painel() {
  const { dados, erro, atualizadoEm } = useAtualizacao(buscarComCache, 3000);
  const chamadas = dados ?? lerCache();
  const [somAtivo, setSomAtivo] = useState(lerPreferenciaSom);
  // O navegador só libera áudio depois do primeiro clique na página: até lá, mostra um aviso
  const [precisaClique, setPrecisaClique] = useState(() => !paginaJaClicada());
  const anunciadas = useRef(null); // chamadas já anunciadas (ou já existentes ao abrir o painel)

  useEffect(() => {
    if (!precisaClique) return undefined;
    const liberar = () => setPrecisaClique(false);
    window.addEventListener('pointerdown', liberar, { once: true });
    window.addEventListener('keydown', liberar, { once: true });
    return () => {
      window.removeEventListener('pointerdown', liberar);
      window.removeEventListener('keydown', liberar);
    };
  }, [precisaClique]);

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
      if (somAtivo) falarChamada(s, s.guiche, Boolean(s.repetida));
    });
  }, [dados, somAtivo]);

  // Desativado, as chamadas novas só aparecem na tela (não ficam acumuladas para depois).
  // A escolha fica salva no navegador: o painel abre do jeito que foi deixado.
  function alternarSom() {
    const ativar = !somAtivo;
    setSomAtivo(ativar);
    salvarPreferenciaSom(ativar);
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (ativar) {
      window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance('Som ativado'), { lang: 'pt-BR' }));
    }
  }

  return (
    <section aria-labelledby="p-titulo">
      <div className="painel-topo">
        <h2 id="p-titulo">Últimas senhas chamadas</h2>
        <button className={somAtivo ? 'secundario' : 'grande'} aria-pressed={somAtivo} onClick={alternarSom}>
          {somAtivo ? '🔇 Desativar som' : '🔈 Ativar som'}
        </button>
      </div>
      {somAtivo && precisaClique && (
        <p className="aviso" role="status">🔊 Clique em qualquer lugar da tela para liberar o som das chamadas.</p>
      )}
      <AvisoConexao erro={erro} atualizadoEm={atualizadoEm} />
      {chamadas.length === 0 ? (
        <p className="cartao vazio">Nenhuma senha chamada ainda.</p>
      ) : (
        <div aria-live="polite">
          <div className="chamada-atual">
            <div>
              <span className="rotulo">Senha</span>
              <div className="numero">{chamadas[0].numero}</div>
              <div className="extra">
                <span className="tipo">{TIPOS[chamadas[0].tipo]}</span>
                {Boolean(chamadas[0].repetida) && <span className="ultima">Última chamada</span>}
              </div>
            </div>
            <div className="guiche">
              <span className="rotulo">Guichê</span>
              <strong>{chamadas[0].guiche}</strong>
            </div>
          </div>
          {chamadas.length > 1 && (
            <ol className="painel" aria-label="Chamadas anteriores">
              {chamadas.slice(1).map((s) => (
                <li key={s.numero}>
                  <div>
                    <div className="numero">{s.numero}</div>
                    <div className="info">
                      <span className={`tipo tipo-${s.tipo}`}>{s.tipo}</span>
                      {TIPOS[s.tipo]}
                      {Boolean(s.repetida) && <span className="ultima">Última chamada</span>}
                    </div>
                  </div>
                  <span className="guiche">Guichê {s.guiche}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}
