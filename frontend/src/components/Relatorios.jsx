import { useEffect, useState } from 'react';
import { relatorio } from '../services/api.js';
import { ESTADOS, TIPOS } from '../services/constantes.js';
import Tabela from './Tabela.jsx';

const hojeISO = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD no fuso local

const hora = (v) => (v ? v.slice(11, 19) : '');
const dataHora = (v) => (v ? `${v.slice(8, 10)}/${v.slice(5, 7)} ${v.slice(11, 16)}` : '');

function duracao(segundos) {
  if (segundos == null) return '—';
  const s = Math.round(Number(segundos));
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
}

export default function Relatorios() {
  const [filtro, setFiltro] = useState({ periodo: 'diario', data: hojeISO() });
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    relatorio(filtro.periodo, filtro.data)
      .then((r) => ativo && setDados(r))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => { ativo = false; };
  }, [filtro]);

  const alterar = (e) => setFiltro({ ...filtro, [e.target.name]: e.target.value });

  return (
    <section aria-labelledby="r-titulo">
      <h3 id="r-titulo">Relatórios</h3>
      <form className="cartao linha" onSubmit={(e) => e.preventDefault()}>
        <label>
          Período{' '}
          <select name="periodo" value={filtro.periodo} onChange={alterar}>
            <option value="diario">Diário</option>
            <option value="mensal">Mensal</option>
          </select>
        </label>
        <label>
          Data{' '}
          <input type="date" name="data" required value={filtro.data} onChange={alterar} />
        </label>
      </form>

      {erro && <p className="alerta" role="alert">{erro}</p>}
      {carregando && <p>Carregando…</p>}

      {dados && !carregando && (
        <>
          <div className="cartoes">
            <div><span>Emitidas</span><strong>{dados.totais.emitidas}</strong></div>
            <div><span>Atendidas</span><strong>{dados.totais.atendidas}</strong></div>
            <div><span>Tempo médio (TM)</span><strong>{duracao(dados.tempoMedioSegundos)}</strong></div>
          </div>

          <h4>Por prioridade</h4>
          <Tabela
            colunas={['Tipo', 'Emitidas', 'Atendidas', 'TM']}
            linhas={Object.keys(TIPOS).map((tipo) => {
              const t = dados.porTipo.find((x) => x.tipo === tipo);
              return [`${tipo} — ${TIPOS[tipo]}`, t?.emitidas ?? 0, Number(t?.atendidas ?? 0), duracao(t?.tm_segundos)];
            })}
          />

          <h4>Detalhado</h4>
          <Tabela
            colunas={['Senha', 'Tipo', 'Situação', 'Emissão', 'Atendimento', 'Guichê']}
            linhas={dados.detalhado.map((s) => [
              s.numero, s.tipo, ESTADOS[s.estado], dataHora(s.emitida_em),
              s.estado === 'ATENDIDA' ? dataHora(s.atendida_em) : '',
              s.estado === 'ATENDIDA' ? s.guiche : '',
            ])}
          />

          <h4>Auditoria</h4>
          <Tabela
            colunas={['Atendente', 'Guichê', 'Senha', '1ª chamada', '2ª chamada', 'Início', 'Fim']}
            linhas={dados.auditoria.map((a) => [
              a.atendente, a.guiche, a.numero, hora(a.primeira_chamada), hora(a.segunda_chamada),
              hora(a.inicio_atendimento), hora(a.fim_atendimento),
            ])}
          />
        </>
      )}
    </section>
  );
}
