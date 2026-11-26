// Cliente da API REST do backend (Agente Sistema).
// Todas as telas usam estas funções; nenhuma tela chama fetch diretamente.

const TEMPO_LIMITE_MS = 8000;
const CHAVE_SESSAO = 'nassauTickets.sessao';

export class ApiError extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status; // 0 = sem conexão com o backend
  }
  get semConexao() {
    return this.status === 0 || this.status === 503;
  }
}

// ---------- Sessão do atendente (token JWT) ----------
export function lerSessao() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO));
  } catch {
    return null;
  }
}

function salvarSessao(sessao) {
  try {
    if (sessao) sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    else sessionStorage.removeItem(CHAVE_SESSAO);
  } catch {
    /* armazenamento indisponível: a sessão vale só enquanto a página estiver aberta */
  }
}

let aoExpirarSessao = () => {};
export const quandoSessaoExpirar = (fn) => { aoExpirarSessao = fn; };

// ---------- Requisição genérica ----------
async function requisicao(metodo, caminho, corpo) {
  const sessao = lerSessao();
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(sessao?.token && { Authorization: `Bearer ${sessao.token}` }),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: controle.signal,
    });
  } catch {
    throw new ApiError('Sem conexão com o servidor. Tente novamente em instantes.', 0);
  } finally {
    clearTimeout(timer);
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    // O proxy do Vite devolve 500/502/504 quando o backend está desligado
    if ([502, 504].includes(resposta.status) || (resposta.status === 500 && !dados.erro)) {
      throw new ApiError('Sem conexão com o servidor. Tente novamente em instantes.', 0);
    }
    if (resposta.status === 401 && sessao) {
      salvarSessao(null);
      aoExpirarSessao();
    }
    throw new ApiError(dados.erro || `Erro ${resposta.status}`, resposta.status);
  }
  return dados;
}

// ---------- Autenticação ----------
export async function entrar(login, senha) {
  const sessao = await requisicao('POST', '/auth/login', { login, senha });
  salvarSessao(sessao);
  return sessao;
}
export const sair = () => salvarSessao(null);

// ---------- Totem e painel (anônimos) ----------
export const saude = () => requisicao('GET', '/saude');
export const emitirSenha = (tipo) => requisicao('POST', '/senhas', { tipo });
export const ultimasChamadas = () => requisicao('GET', '/painel');

// ---------- Atendente ----------
export const atendimentoAtual = () => requisicao('GET', '/atendimento/atual');
export const chamarProxima = (guiche) => requisicao('POST', '/atendimento/chamar', { guiche });
const acao = (nome) => (numero) => requisicao('POST', `/atendimento/${encodeURIComponent(numero)}/${nome}`);
export const chamarNovamente = acao('chamar-novamente');
export const iniciarAtendimento = acao('iniciar');
export const finalizarAtendimento = acao('finalizar');
export const naoCompareceu = acao('nao-compareceu');

// ---------- Gestor ----------
export const relatorio = (periodo, data) =>
  requisicao('GET', `/relatorios?periodo=${periodo}&data=${data}`);
export const cadastrarUsuario = (usuario) => requisicao('POST', '/usuarios', usuario);
export const encerrarExpediente = () => requisicao('POST', '/expediente/encerrar');
