import { useState } from 'react';
import { emitirSenha } from '../services/api.js';
import { TIPOS } from '../services/constantes.js';

// Totem de autoatendimento: o cliente (AC) é anônimo, nenhum dado pessoal é coletado (LGPD).
export default function Totem() {
  const [ultima, setUltima] = useState(null);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function emitir(tipo) {
    setEnviando(true);
    setErro('');
    try {
      setUltima(await emitirSenha(tipo));
    } catch (e) {
      setUltima(null);
      setErro(e.semConexao ? 'Não foi possível emitir a senha agora. Procure a recepção.' : e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section aria-labelledby="t-titulo">
      <h2 id="t-titulo">Retire sua senha</h2>
      <div className="botoes">
        {Object.entries(TIPOS).map(([tipo, nome]) => (
          <button key={tipo} className="grande" disabled={enviando} onClick={() => emitir(tipo)}>
            {nome} ({tipo})
          </button>
        ))}
      </div>
      {erro && <p className="alerta" role="alert">{erro}</p>}
      {ultima && (
        <p className="aviso" role="status">
          Sua senha: <strong className="senha">{ultima.numero}</strong> Aguarde ser chamado no painel.
        </p>
      )}
      {!ultima && !erro && <p>Escolha o tipo de atendimento.</p>}
    </section>
  );
}
