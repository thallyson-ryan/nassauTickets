import { useState } from 'react';
import { cadastrarUsuario, encerrarExpediente } from '../services/api.js';
import Relatorios from './Relatorios.jsx';

const VAZIO = { nome: '', login: '', senha: '', perfil: 'ATENDENTE' };

function CadastroAtendente() {
  const [form, setForm] = useState(VAZIO);
  const [retorno, setRetorno] = useState(null);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    try {
      await cadastrarUsuario(form);
      setRetorno({ ok: true, texto: `Usuário ${form.login} cadastrado.` });
      setForm(VAZIO);
    } catch (e) {
      setRetorno({ ok: false, texto: e.message });
    }
  }

  return (
    <section aria-labelledby="c-titulo" className="cartao">
      <h3 id="c-titulo">Cadastrar atendente</h3>
      <form className="formulario" onSubmit={enviar}>
        <label>Nome<input name="nome" required value={form.nome} onChange={alterar} /></label>
        <label>Login<input name="login" required autoComplete="off" value={form.login} onChange={alterar} /></label>
        <label>
          Senha (mínimo 8 caracteres)
          <input name="senha" type="password" required minLength={8} autoComplete="new-password"
            value={form.senha} onChange={alterar} />
        </label>
        <label>
          Perfil
          <select name="perfil" value={form.perfil} onChange={alterar}>
            <option value="ATENDENTE">Atendente</option>
            <option value="GESTOR">Gestor</option>
          </select>
        </label>
        {retorno && (
          <p className={retorno.ok ? 'aviso' : 'alerta'} role={retorno.ok ? 'status' : 'alert'}>{retorno.texto}</p>
        )}
        <button className="grande" type="submit">Cadastrar</button>
      </form>
    </section>
  );
}

function Expediente() {
  const [texto, setTexto] = useState('');

  async function encerrar() {
    if (!window.confirm('Descartar as senhas que ainda aguardam na fila? Atendimentos em curso continuam.')) return;
    try {
      const r = await encerrarExpediente();
      setTexto(`${r.descartadas} senha(s) descartada(s).`);
    } catch (e) {
      setTexto(e.message);
    }
  }

  return (
    <section aria-labelledby="e-titulo" className="cartao">
      <h3 id="e-titulo">Expediente (07h às 17h)</h3>
      <p className="dica">Após as 17h a fila restante é descartada automaticamente. Use o botão para forçar o descarte agora.</p>
      <button className="perigo" onClick={encerrar}>Descartar fila restante</button>
      {texto && <p className="aviso" role="status">{texto}</p>}
    </section>
  );
}

export default function Gestor() {
  return (
    <section aria-labelledby="g-titulo">
      <h2 id="g-titulo">Área do gestor</h2>
      <Relatorios />
      <div className="colunas">
        <CadastroAtendente />
        <Expediente />
      </div>
    </section>
  );
}
