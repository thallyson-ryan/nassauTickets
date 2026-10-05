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

Na fase 1, o frontend usa `src/services/filaService.js`, que simula o Agente Sistema em memória.
Na fase 2, esse serviço passa a consumir a API REST do backend.

## Instalação e execução

```bash
cd frontend
npm install
npm run dev
```

Abra o endereço exibido no terminal (normalmente http://localhost:5173).
Não há variáveis de ambiente obrigatórias nesta fase.

## Estrutura do repositório

```
backend/    API (fase 2)
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
- **Falhas:** `GET /api/saude`; erros de banco retornam 503 para o frontend e o painel exibirem aviso e tentarem de novo.
- **HTTPS:** defina `SSL_KEY` e `SSL_CERT` no `.env`, ou use proxy reverso (nginx).
