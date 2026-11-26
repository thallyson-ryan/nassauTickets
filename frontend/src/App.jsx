import { useEffect, useState } from 'react';
import Totem from './components/Totem.jsx';
import Painel from './components/Painel.jsx';
import Atendente from './components/Atendente.jsx';
import Gestor from './components/Gestor.jsx';
import Login from './components/Login.jsx';
import Logo from './components/Logo.jsx';
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

  // Troca de tela e guarda no endereço (recarregar a página mantém a tela)
  function abrir(chave) {
    setTela(chave);
    window.history.replaceState(null, '', `#${chave}`);
  }

  return (
    <>
      <header className="topo">
        <div className="topo-conteudo">
          <div className="marca">
            <Logo tamanho={36} />
            <h1>nassau<span>Tickets</span></h1>
          </div>
          <nav aria-label="Telas">
            {visiveis.map((t) => (
              <button key={t.chave} className="aba" aria-pressed={tela === t.chave} onClick={() => abrir(t.chave)}>
                {t.nome}
              </button>
            ))}
          </nav>
        </div>
        {sessao && (
          <div className="sessao">
            <span>Conectado como <strong>{sessao.nome}</strong> · {sessao.perfil === 'GESTOR' ? 'gestor' : 'atendente'}</span>
            <button className="link" onClick={encerrarSessao}>Sair</button>
          </div>
        )}
      </header>

      <main className={`tela tela-${tela}`}>
      {tela === 'totem' && <Totem />}
      {tela === 'painel' && <Painel />}
      {precisaLogin && <Login onEntrar={setSessao} />}
      {!precisaLogin && tela === 'atendente' && <Atendente />}
      {semPermissao && (
        <p className="alerta" role="alert">Esta tela é restrita ao perfil gestor.</p>
      )}
      {!precisaLogin && !semPermissao && tela === 'gestor' && <Gestor />}
      </main>
    </>
  );
}
