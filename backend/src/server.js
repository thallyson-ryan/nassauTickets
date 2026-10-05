import 'dotenv/config';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

const { JWT_SECRET, PORT = 3000 } = process.env;
if (!JWT_SECRET) throw new Error('Defina JWT_SECRET no .env');

const pool = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  connectionLimit: 10, dateStrings: true,
});

const pad = (n, l = 2) => String(n).padStart(l, '0');
const hoje = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const agora = (d = new Date()) => `${hoje(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const emExpediente = () => { const h = new Date().getHours(); return h >= 7 && h < 17; }; // 07h–17h

// Executa em transação (rollback automático em erro)
async function tx(fn) {
  const c = await pool.getConnection();
  try { await c.beginTransaction(); const r = await fn(c); await c.commit(); return r; }
  catch (e) { await c.rollback(); throw e; }
  finally { c.release(); }
}
const erro = (status, msg) => Object.assign(new Error(msg), { status });
const rota = (fn) => (req, res, next) => fn(req, res).catch(next);

// ---------- Autenticação ----------
const auth = (...perfis) => (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.user = jwt.verify(token, JWT_SECRET);
    if (perfis.length && !perfis.includes(req.user.perfil)) throw erro(403, 'Sem permissão');
    next();
  } catch (e) { next(e.status ? e : erro(401, 'Não autenticado')); }
};

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/api/saude', rota(async (_q, res) => { await pool.query('SELECT 1'); res.json({ ok: true }); }));

app.post('/api/auth/login', rota(async (req, res) => {
  const { login, senha } = req.body;
  const [[u]] = await pool.query('SELECT * FROM usuarios WHERE login = ?', [login]);
  if (!u || !(await bcrypt.compare(senha || '', u.senha_hash))) throw erro(401, 'Login ou senha inválidos');
  const token = jwt.sign({ id: u.id, nome: u.nome, perfil: u.perfil }, JWT_SECRET, { expiresIn: '10h' });
  res.json({ token, nome: u.nome, perfil: u.perfil });
}));

app.post('/api/usuarios', auth('GESTOR'), rota(async (req, res) => {
  const { nome, login, senha, perfil = 'ATENDENTE' } = req.body;
  if (!nome || !login || !senha || senha.length < 8) throw erro(400, 'Dados inválidos (senha mínima de 8 caracteres)');
  await pool.query('INSERT INTO usuarios (nome, login, senha_hash, perfil) VALUES (?,?,?,?)',
    [nome, login, await bcrypt.hash(senha, 10), perfil]);
  res.status(201).json({ ok: true });
}));

// ---------- Totem (anônimo) ----------
app.post('/api/senhas', rota(async (req, res) => {
  const { tipo } = req.body;
  if (!['SP', 'SE', 'SG'].includes(tipo)) throw erro(400, 'Tipo inválido');
  if (!emExpediente()) throw erro(403, 'Fora do expediente (07h–17h)');
  const senha = await tx(async (c) => {
    await c.query('SELECT id FROM controle_fila WHERE id = 1 FOR UPDATE'); // serializa emissões
    const [[{ m }]] = await c.query('SELECT COALESCE(MAX(seq),0) AS m FROM senhas WHERE data=? AND tipo=?', [hoje(), tipo]);
    const seq = m + 1, d = new Date();
    const numero = `${pad(d.getFullYear() % 100)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${tipo}${pad(seq, 3)}`;
    await c.query(`INSERT INTO senhas (numero,tipo,seq,data,estado,emitida_em) VALUES (?,?,?,?, 'AGUARDANDO', ?)`,
      [numero, tipo, seq, hoje(), agora()]);
    return { numero, tipo, estado: 'AGUARDANDO' };
  });
  res.status(201).json(senha);
}));

app.get('/api/painel', rota(async (_q, res) => {
  const [rows] = await pool.query(
    `SELECT numero, tipo, guiche, estado, COALESCE(segunda_chamada, primeira_chamada) AS chamada_em
     FROM senhas WHERE data=? AND primeira_chamada IS NOT NULL AND estado <> 'NAO_COMPARECEU'
     ORDER BY chamada_em DESC LIMIT 5`, [hoje()]);
  res.json(rows);
}));

// ---------- Atendente ----------
const ATIVOS = "('CHAMADA','CHAMADA_NOVAMENTE','EM_ATENDIMENTO')";

app.post('/api/atendimento/chamar', auth(), rota(async (req, res) => {
  const guiche = Number(req.body.guiche);
  if (!guiche) throw erro(400, 'Informe o guichê');
  if (!emExpediente()) throw erro(403, 'Fora do expediente (07h–17h)');
  const senha = await tx(async (c) => {
    // Concorrência: o lock da linha faz dois atendentes serem processados um após o outro
    const [[ctl]] = await c.query('SELECT proxima_sp FROM controle_fila WHERE id = 1 FOR UPDATE');
    const [[ativa]] = await c.query(`SELECT id FROM senhas WHERE usuario_id=? AND data=? AND estado IN ${ATIVOS}`, [req.user.id, hoje()]);
    if (ativa) throw erro(409, 'Conclua o atendimento atual antes de chamar outra senha');
    const ordem = ctl.proxima_sp ? ['SP', 'SE', 'SG'] : ['SE', 'SG', 'SP'];
    for (const tipo of ordem) {
      const [[s]] = await c.query(
        `SELECT * FROM senhas WHERE data=? AND tipo=? AND estado='AGUARDANDO' ORDER BY seq LIMIT 1`, [hoje(), tipo]);
      if (!s) continue;
      await c.query(`UPDATE senhas SET estado='CHAMADA', guiche=?, usuario_id=?, primeira_chamada=? WHERE id=?`,
        [guiche, req.user.id, agora(), s.id]);
      await c.query('UPDATE controle_fila SET proxima_sp=? WHERE id=1', [tipo !== 'SP']);
      return { numero: s.numero, tipo, guiche, estado: 'CHAMADA' };
    }
    return null;
  });
  if (!senha) return res.status(204).end(); // fila vazia
  res.json(senha);
}));

// Transição de estado validada: só o atendente dono da senha, a partir de estados permitidos
function transicao(nome, de, para, extra) {
  app.post(`/api/atendimento/:numero/${nome}`, auth(), rota(async (req, res) => {
    const [r] = await pool.query(
      `UPDATE senhas SET estado=?, ${extra} WHERE numero=? AND usuario_id=? AND estado IN (?)`,
      [para, req.params.numero, req.user.id, de]);
    if (!r.affectedRows) throw erro(409, 'Transição inválida para o estado atual da senha');
    res.json({ numero: req.params.numero, estado: para });
  }));
}
transicao('chamar-novamente', ['CHAMADA'], 'CHAMADA_NOVAMENTE', 'segunda_chamada=NOW()');
transicao('iniciar', ['CHAMADA', 'CHAMADA_NOVAMENTE'], 'EM_ATENDIMENTO', 'inicio_atendimento=NOW()');
transicao('finalizar', ['EM_ATENDIMENTO'], 'ATENDIDA', 'fim_atendimento=NOW()');
transicao('nao-compareceu', ['CHAMADA_NOVAMENTE'], 'NAO_COMPARECEU', "motivo='AUSENTE'");

app.get('/api/atendimento/atual', auth(), rota(async (req, res) => {
  const [[s]] = await pool.query(
    `SELECT numero, tipo, guiche, estado FROM senhas WHERE usuario_id=? AND data=? AND estado IN ${ATIVOS}`,
    [req.user.id, hoje()]);
  const [[{ n }]] = await pool.query(`SELECT COUNT(*) AS n FROM senhas WHERE data=? AND estado='AGUARDANDO'`, [hoje()]);
  res.json({ atual: s || null, aguardando: n });
}));

// ---------- Expediente ----------
// Descarta a fila de dias anteriores e, após 17h, a do dia. Atendimentos em curso NÃO são interrompidos:
// o atendente os conclui normalmente.
async function descartarFila() {
  const h = new Date().getHours();
  const [r] = await pool.query(
    `UPDATE senhas SET estado='NAO_COMPARECEU', motivo='DESCARTADA_FIM_EXPEDIENTE'
     WHERE estado='AGUARDANDO' AND (data < ? OR (data = ? AND ? >= 17))`, [hoje(), hoje(), h]);
  return r.affectedRows;
}
setInterval(() => descartarFila().catch(() => {}), 60_000);
app.post('/api/expediente/encerrar', auth('GESTOR'), rota(async (_q, res) => res.json({ descartadas: await descartarFila() })));

// ---------- Relatórios (gestor) ----------
app.get('/api/relatorios', auth('GESTOR'), rota(async (req, res) => {
  const { periodo = 'diario', data = hoje() } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw erro(400, 'Data inválida (use YYYY-MM-DD)');
  const [ini, fim] = periodo === 'mensal'
    ? [data.slice(0, 8) + '01', null] : [data, data];
  const filtro = periodo === 'mensal' ? 'DATE_FORMAT(s.data, "%Y-%m") = ?' : 's.data = ?';
  const param = periodo === 'mensal' ? data.slice(0, 7) : data;

  const [porTipo] = await pool.query(
    `SELECT tipo, COUNT(*) AS emitidas, SUM(estado='ATENDIDA') AS atendidas,
            ROUND(AVG(TIMESTAMPDIFF(SECOND, inicio_atendimento, fim_atendimento))) AS tm_segundos
     FROM senhas s WHERE ${filtro} GROUP BY tipo`, [param]);
  const [detalhado] = await pool.query(
    `SELECT numero, tipo, estado, emitida_em, inicio_atendimento AS atendida_em, guiche
     FROM senhas s WHERE ${filtro} ORDER BY emitida_em`, [param]);
  const [auditoria] = await pool.query(
    `SELECT u.nome AS atendente, s.guiche, s.numero, s.primeira_chamada, s.segunda_chamada,
            s.inicio_atendimento, s.fim_atendimento
     FROM senhas s JOIN usuarios u ON u.id = s.usuario_id WHERE ${filtro} ORDER BY s.primeira_chamada`, [param]);
  const [[tm]] = await pool.query(
    `SELECT ROUND(AVG(TIMESTAMPDIFF(SECOND, inicio_atendimento, fim_atendimento))) AS tm_segundos
     FROM senhas s WHERE ${filtro} AND estado='ATENDIDA'`, [param]);

  res.json({
    periodo, referencia: param,
    totais: {
      emitidas: porTipo.reduce((a, t) => a + t.emitidas, 0),
      atendidas: porTipo.reduce((a, t) => a + Number(t.atendidas), 0),
    },
    porTipo, tempoMedioSegundos: tm.tm_segundos, detalhado, auditoria,
  });
}));

// ---------- Tratamento de erros e recuperação ----------
app.use((e, _q, res, _n) => {
  if (e.status) return res.status(e.status).json({ erro: e.message });
  if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') return res.status(401).json({ erro: 'Sessão inválida' });
  if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Registro duplicado' });
  console.error(e);
  // Banco indisponível: 503 permite ao frontend/painel exibir aviso e tentar de novo
  const fora = ['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ETIMEDOUT', 'ER_ACCESS_DENIED_ERROR'].includes(e.code);
  res.status(fora ? 503 : 500).json({ erro: fora ? 'Serviço temporariamente indisponível' : 'Erro interno' });
});

// ---------- Inicialização ----------
async function semear() {
  const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM usuarios');
  if (n === 0 && process.env.GESTOR_SENHA) {
    await pool.query('INSERT INTO usuarios (nome, login, senha_hash, perfil) VALUES (?,?,?,?)',
      ['Gestor', process.env.GESTOR_LOGIN || 'gestor', await bcrypt.hash(process.env.GESTOR_SENHA, 10), 'GESTOR']);
    console.log('Usuário gestor criado.');
  }
}

const { SSL_KEY, SSL_CERT } = process.env;
const servidor = SSL_KEY && SSL_CERT
  ? https.createServer({ key: fs.readFileSync(SSL_KEY), cert: fs.readFileSync(SSL_CERT) }, app)
  : http.createServer(app); // em produção use HTTPS direto ou via proxy reverso
servidor.listen(PORT, async () => {
  console.log(`API em ${SSL_KEY ? 'https' : 'http'}://localhost:${PORT}`);
  try { await semear(); await descartarFila(); } catch (e) { console.error('Banco indisponível na inicialização:', e.code); }
});
