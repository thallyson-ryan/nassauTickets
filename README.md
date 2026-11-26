# nassauTickets

Sistema de Controle de Atendimento (tickets/senhas) para um Laboratório de Análises Clínicas.

## Descrição e objetivo

O sistema organiza a emissão, a fila, a chamada e o atendimento de senhas em um laboratório,
com três agentes: **AS** (Agente Sistema), **AA** (Agente Atendente) e **AC** (Agente Cliente).
Tipos de senha: **SP** (Prioritária), **SE** (Retirada de Exames) e **SG** (Geral).
O objetivo é praticar desenvolvimento Web com React, organização de projeto, documentação e Git/GitHub.

## Membros

| Nome | Matrícula | Papel |
|------|-----------|-------|
| Nome do aluno | 000000 | Scrum Master |
| Nome do aluno | 000000 | Documentador |
| Nome do aluno | 000000 | Desenvolvedor |
| Nome do aluno | 000000 | Desenvolvedor |
| Nome do aluno | 000000 | Testador |

## Tecnologias

- Frontend: React 19 + Vite (JavaScript)
- Backend (planejado): Node.js LTS 22 com Express. Justificativa: mesma linguagem do frontend, o que facilita o trabalho do grupo.
- Banco de dados (planejado): MySQL 8.0

## Visão geral da arquitetura

```
Totem (AC) ─────┐
Atendente (AA) ─┼─> Frontend React ──REST/JSON──> Backend (AS) ──> MySQL
Painel ─────────┘
```

O frontend consome a API REST do backend por meio de `frontend/src/services/api.js`.
Em desenvolvimento, o Vite repassa as chamadas `/api` para `http://localhost:3000`
(para outro endereço, crie `frontend/.env` com `VITE_API_URL=...`).

| Tela | Quem usa | O que faz |
|------|----------|-----------|
| Totem | Cliente (anônimo) | Emite senha SP, SE ou SG |
| Painel | Público | Mostra as 5 últimas senhas chamadas, atualiza a cada 3 s |
| Atendente | Atendente (login) | Chama, chama novamente, inicia e encerra atendimento; marca não comparecimento |
| Gestor | Gestor (login) | Relatórios diário/mensal, cadastro de atendentes, descarte da fila |

## Instalação e execução

Pré-requisitos: Node.js 22 e MySQL 8.0 rodando.

**1. Banco e backend** (terminal 1)

```bash
cd backend
cp .env.example .env        # preencha DB_PASSWORD, JWT_SECRET e GESTOR_SENHA
mysql -u root -p < sql/schema.sql
npm install
npm run dev                 # http://localhost:3000
```

No Windows, se o comando `mysql` não for encontrado, execute o `schema.sql` pelo MySQL Workbench
ou use o caminho completo: `"C:Program FilesMySQLMySQL Server 8.0inmysql.exe"`.

**2. Frontend** (terminal 2)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Na primeira execução o backend cria o usuário gestor com `GESTOR_LOGIN` e `GESTOR_SENHA` do `.env`.
Entre na tela **Atendente** com esse usuário; pela tela **Gestor** cadastre os demais atendentes.

## Estrutura do repositório

```
backend/    API REST (Express) e script do banco (sql/schema.sql)
docs/       branding, mer, mockups, models/uml, requirements
frontend/   aplicação React
```

## Branches

- `main`: versão estável, recebe merges da `dev`.
- `dev`: desenvolvimento diário.

Padrão de commits: `feat:`, `fix:`, `docs:`, `chore:`.

## Status da fase 1

- [x] Estrutura, licença, .gitignore e README
- [x] Requisitos iniciais (`docs/requirements`)
- [x] Totem, painel e terminal do atendente (React)
- [x] Regra de prioridade, numeração e máquina de estados
- [ ] Backend, MySQL, login/gestor, relatórios, expediente 7h–17h, concorrência, contingência

## Backend (Node.js + Express + MySQL)

```bash
cd backend
cp .env.example .env        # ajuste DB_*, JWT_SECRET e a senha do gestor
mysql -u root -p < sql/schema.sql
npm install
npm run dev                 # http://localhost:3000
```

- **Login/perfis:** JWT (10 h), senhas com hash bcrypt. O primeiro gestor é criado a partir do `.env`; ele cadastra atendentes em `POST /api/usuarios`.
- **Concorrência:** a chamada roda em transação com `SELECT ... FOR UPDATE` na tabela `controle_fila`, então dois atendentes simultâneos recebem senhas diferentes.
- **Expediente:** emissão e chamada só entre 07h e 17h. Após as 17h a fila restante é descartada (`NAO_COMPARECEU` / `DESCARTADA_FIM_EXPEDIENTE`); atendimentos em curso são concluídos pelo atendente.
- **Relatórios:** `GET /api/relatorios?periodo=diario|mensal&data=YYYY-MM-DD` (gestor): totais, por prioridade, detalhado, tempo médio e auditoria.
- **Falhas:** `GET /api/saude`; erros de banco retornam 503. O painel guarda as últimas chamadas no navegador e continua exibindo-as com um aviso de "Sistema temporariamente indisponível", tentando reconectar a cada 3 s; o totem orienta o cliente a procurar a recepção.
- **HTTPS:** defina `SSL_KEY` e `SSL_CERT` no `.env`, ou use proxy reverso (nginx).
