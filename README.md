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
| Thallyson Ryan Araujo de Moraes | 01855140 | Scrum Master / Desenvolvedor |
| Caio Gabriel Vilela Ferreira | 01858920 | Documentador |
| Richardyson Camilo Santos de Melo | 01644391 | Testador |

## Tecnologias

- Frontend: React 19 + Vite (JavaScript)
- Backend: Node.js LTS 22 com Express. Justificativa: mesma linguagem do frontend, o que facilita o trabalho do grupo.
- Banco de dados: MySQL 8.0

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
| Painel | Público | Mostra as 5 últimas senhas chamadas, atualiza a cada 3 s e anuncia cada chamada por áudio |
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
ou use o caminho completo: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`.

**2. Frontend** (terminal 2)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Na primeira execução o backend cria o usuário gestor com `GESTOR_LOGIN` e `GESTOR_SENHA` do `.env`.
Entre na tela **Atendente** com esse usuário; pela tela **Gestor** cadastre os demais atendentes.

Uma tela pode ser aberta direto pelo endereço, por exemplo `http://localhost:5173/#painel` (TV da recepção).
Para acessar de outro dispositivo da mesma rede, rode o frontend com `npm run dev -- --host` e use o IP do computador.

**Áudio do painel:** o painel abre com o som ligado (o botão **Desativar som** silencia, e a escolha fica salva no navegador).
O Chrome e o Edge só liberam áudio depois de um clique na página; enquanto isso, o painel mostra o aviso
"Clique em qualquer lugar da tela para liberar o som". Na TV da recepção, para dispensar o clique, abra o Chrome assim:
`chrome.exe --autoplay-policy=no-user-gesture-required http://localhost:5173/#painel`
O Windows precisa ter a voz **Português (Brasil)** instalada (Configurações → Hora e idioma → Fala → Adicionar vozes).
Se a instalação travar, use no PowerShell aberto como administrador:
`Add-WindowsCapability -Online -Name "Language.TextToSpeech~~~pt-BR~0.0.1.0"`

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [Requisitos](docs/requirements/requisitos.md) | Agentes, requisitos funcionais e não funcionais, regras de negócio |
| [Requisitos não funcionais](docs/requirements/nao-funcionais.md) | LGPD, acessibilidade, recuperação de falhas e métricas |
| [MER](docs/mer/mer.md) | Modelo do banco de dados |
| [Casos de uso](docs/models/uml/casos-de-uso.md) | Diagrama e descrição dos casos de uso |
| [Estados da senha](docs/models/uml/estados-senha.md) | Máquina de estados |
| [Sequência da chamada](docs/models/uml/sequencia-chamada.md) | Chamada com dois atendentes ao mesmo tempo (concorrência) |
| [Mockups](docs/mockups/mockups.md) | Esboços das telas |
| [Branding](docs/branding/branding.md) | Logo, cores, tipografia e tom de voz |
| [Testes](docs/requirements/testes.md) | Plano, resultados e bugs encontrados |

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

## Status

- [x] Estrutura, licença, .gitignore e README
- [x] Requisitos, LGPD, acessibilidade e recuperação de falhas (`docs/requirements`)
- [x] Totem, painel, terminal do atendente e área do gestor (React)
- [x] Regra de prioridade, numeração e máquina de estados
- [x] Backend, MySQL, login/gestor, relatórios, expediente 7h–17h, concorrência, contingência
- [x] Áudio das chamadas no painel
- [x] MER, UML, mockups e branding (`docs/`)
- [x] Plano e execução dos testes

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
