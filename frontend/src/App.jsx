import { useEffect, useState } from 'react';
import Totem from './components/Totem.jsx';
import Painel from './components/Painel.jsx';
import Atendente from './components/Atendente.jsx';
import Gestor from './components/Gestor.jsx';
import Login from './components/Login.jsx';
import { lerSessao, quandoSessaoExpirar, sair } from './services/api.js';

const TELAS = [
  { chave: 'totem', nome: 'Totem' },
  { chave: 'painel', nome: 'Painel' },
  { chave: 'atendente', nome: 'Atendente', login: true },
  { chave: 'gestor', nome: 'Gestor', perfil: 'GESTOR' },
];

export default function App() {
  // Permite abrir uma tela direto pelo endereço, ex.: http://localhost:5173/#painel (TV da recepção)
  const [tela, setTela] = useState(() => {
    const hash = window.location.hash.slice(1);
    return TELAS.some((t) => t.chave === hash) ? hash : 'totem';
  });
  const [sessao, setSessao] = useState(lerSessao);

  // Token expirado ou inválido: volta para o login
  useEffect(() => quandoSessaoExpirar(() => setSessao(null)), []);

  function encerrarSessao() {
    sair();
    setSessao(null);
  }

  const visiveis = TELAS.filter((t) => !t.perfil || sessao?.perfil === t.perfil);
  const atual = TELAS.find((t) => t.chave === tela);
  const precisaLogin = (atual.login || atual.perfil) && !sessao;
  // Tela restrita a um perfil (ex.: #gestor digitado no endereço por um atendente comum)
  const semPermissao = !precisaLogin && atual.perfil && sessao?.perfil !== atual.perfil;

  return (
    <main>
      <header>
        <h1>nassauTickets</h1>
        <nav aria-label="Telas">
          {visiveis.map((t) => (
            <button key={t.chave} aria-pressed={tela === t.chave} onClick={() => setTela(t.chave)}>
              {t.nome}
            </button>
          ))}
        </nav>
      </header>

      {sessao && (
        <p className="sessao">
          Conectado como <strong>{sessao.nome}</strong> ({sessao.perfil.toLowerCase()}){' '}
          <button onClick={encerrarSessao}>Sair</button>
        </p>
      )}

      {tela === 'totem' && <Totem />}
      {tela === 'painel' && <Painel />}
      {precisaLogin && <Login onEntrar={setSessao} />}
      {!precisaLogin && tela === 'atendente' && <Atendente />}
      {semPermissao && (
        <p className="alerta" role="alert">Esta tela é restrita ao perfil gestor.</p>
      )}
      {!precisaLogin && !semPermissao && tela === 'gestor' && <Gestor />}
    </main>
  );
}
