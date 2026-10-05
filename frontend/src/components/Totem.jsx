import { TIPOS } from '../services/filaService.js';

export default function Totem({ onEmitir, ultima }) {
  return (
    <section aria-labelledby="t-titulo">
      <h2 id="t-titulo">Retire sua senha</h2>
      <div className="botoes">
        {Object.entries(TIPOS).map(([tipo, nome]) => (
          <button key={tipo} className="grande" onClick={() => onEmitir(tipo)}>
            {nome} ({tipo})
          </button>
        ))}
      </div>
      {ultima ? (
        <p className="aviso" role="status">
          Sua senha: <strong>{ultima.numero}</strong>. Aguarde ser chamado no painel.
        </p>
      ) : (
        <p>Escolha o tipo de atendimento.</p>
      )}
    </section>
  );
}
