import { useState } from 'react';
import { entrar } from '../services/api.js';

export default function Login({ onEntrar }) {
  const [form, setForm] = useState({ login: '', senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro('');
    try {
      onEntrar(await entrar(form.login.trim(), form.senha));
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section aria-labelledby="l-titulo">
      <h2 id="l-titulo">Acesso do atendente</h2>
      <form className="formulario" onSubmit={enviar}>
        <label>
          Login
          <input name="login" autoComplete="username" required value={form.login} onChange={alterar} />
        </label>
        <label>
          Senha
          <input name="senha" type="password" autoComplete="current-password" required
            value={form.senha} onChange={alterar} />
        </label>
        {erro && <p className="alerta" role="alert">{erro}</p>}
        <button className="grande" type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}
