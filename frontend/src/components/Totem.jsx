import { useState } from 'react';
import { emitirSenha } from '../services/api.js';
import { TIPOS } from '../services/constantes.js';

const DESCRICOES = {
  SP: 'Idosos, gestantes, pessoas com deficiência',
  SE: 'Buscar resultado de exames',
  SG: 'Coleta e demais atendimentos',
};

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
      <p className="dica">Toque no tipo de atendimento. Não pedimos nenhum dado pessoal.</p>
      <div className="opcoes">
        {Object.entries(TIPOS).map(([tipo, nome]) => (
          <button key={tipo} className={`opcao opcao-${tipo}`} disabled={enviando} onClick={() => emitir(tipo)}>
            <span className="sigla">{tipo}</span>
            <span className="nome">{nome}</span>
            <span className="desc">{DESCRICOES[tipo]}</span>
          </button>
        ))}
      </div>
      {erro && <p className="alerta" role="alert">{erro}</p>}
      {ultima && (
        <div className="bilhete" role="status">
          <p className="rotulo">Sua senha</p>
          <strong className="numero">{ultima.numero}</strong>
          <span className={`tipo tipo-${ultima.tipo}`}>{TIPOS[ultima.tipo]}</span>
          <p>Aguarde ser chamado no painel.</p>
        </div>
      )}
    </section>
  );
}
