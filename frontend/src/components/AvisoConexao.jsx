// Aviso exibido quando o backend ou o banco de dados não respondem.
export default function AvisoConexao({ erro, atualizadoEm }) {
  if (!erro) return null;
  return (
    <p className="alerta" role="alert">
      {erro.semConexao ? 'Sistema temporariamente indisponível. Tentando reconectar…' : erro.message}
      {atualizadoEm && erro.semConexao && (
        <> Exibindo dados de {atualizadoEm.toLocaleTimeString('pt-BR')}.</>
      )}
    </p>
  );
}
