import { useState } from 'react';
import Totem from './components/Totem.jsx';
import Atendente from './components/Atendente.jsx';
import Painel from './components/Painel.jsx';
import * as fila from './services/filaService.js';
import { falarChamada } from './utils/audio.js';

const TELAS = { totem: 'Totem', atendente: 'Atendente', painel: 'Painel' };

export default function App() {
  const [tela, setTela] = useState('totem');
  const [estado, setEstado] = useState(fila.estadoInicial);
  const [ultima, setUltima] = useState(null);

  const acoes = {
    chamar(guiche) {
      const t = fila.escolherProximo(estado);
      if (!t) return;
      setEstado(fila.chamarProximo(estado, guiche));
      falarChamada(t, guiche);
    },
    chamarNovamente(t, guiche) {
      setEstado(fila.chamarNovamente(estado, t.numero));
      falarChamada(t, guiche, true);
    },
    iniciar: (n) => setEstado(fila.iniciarAtendimento(estado, n)),
    finalizar: (n) => setEstado(fila.finalizarAtendimento(estado, n)),
    naoCompareceu: (n) => setEstado(fila.naoCompareceu(estado, n)),
  };

  function emitir(tipo) {
    const novo = fila.emitir(estado, tipo);
    setEstado(novo);
    setUltima(novo.tickets.at(-1));
  }

  return (
    <main>
      <header>
        <h1>nassauTickets</h1>
        <nav aria-label="Telas">
          {Object.entries(TELAS).map(([chave, nome]) => (
            <button key={chave} aria-pressed={tela === chave} onClick={() => setTela(chave)}>
              {nome}
            </button>
          ))}
        </nav>
      </header>
      {tela === 'totem' && <Totem onEmitir={emitir} ultima={ultima} />}
      {tela === 'atendente' && <Atendente tickets={estado.tickets} acoes={acoes} />}
      {tela === 'painel' && <Painel tickets={estado.tickets} />}
    </main>
  );
}
