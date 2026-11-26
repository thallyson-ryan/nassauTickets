// Tabela reutilizável: recebe os títulos das colunas e as linhas já formatadas.
export default function Tabela({ colunas, linhas }) {
  if (linhas.length === 0) return <p>Sem registros no período.</p>;
  return (
    <div className="tabela">
      <table>
        <thead>
          <tr>{colunas.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i}>{linha.map((v, j) => <td key={j}>{v}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
