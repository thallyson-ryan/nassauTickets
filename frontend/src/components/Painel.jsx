export default function Painel({ tickets }) {
  const chamadas = tickets
    .filter((t) => t.chamadas.length > 0 && t.estado !== 'NAO_COMPARECEU')
    .sort((a, b) => b.chamadas.at(-1).localeCompare(a.chamadas.at(-1)))
    .slice(0, 5);

  return (
    <section aria-labelledby="p-titulo">
      <h2 id="p-titulo">Últimas senhas chamadas</h2>
      {chamadas.length === 0 ? (
        <p>Nenhuma senha chamada ainda.</p>
      ) : (
        <ol className="painel">
          {chamadas.map((t, i) => (
            <li key={t.numero} className={i === 0 ? 'destaque' : ''}>
              <span>{t.numero}</span>
              <span>Guichê {t.guiche}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
