# Plano e relatório de testes

**Ambiente:** backend (`cd backend && npm start`), frontend (`cd frontend && npm run dev`), MySQL 8.0, navegador Chrome/Edge.
**Como preencher:** em cada caso, anote o resultado (✅ passou / ❌ falhou), a data e uma observação. Bugs encontrados vão para a tabela no final.

## Totem (AC)

| ID | Caso de teste | Passos | Resultado esperado | Resultado | Data | Observação |
|----|---------------|--------|--------------------|-----------|------|------------|
| CT01 | Emitir senha SP | Clicar em "Prioritária (SP)" | Mostra senha `YYMMDD-SP001` (ou próxima sequência) | | | |
| CT02 | Emitir senha SE e SG | Clicar em cada botão | Número com o tipo correto e sequência própria de cada tipo | | | |
| CT03 | Formato do número | Conferir a senha emitida | Formato `YYMMDD-PPSQ` com a data de hoje | | | |
| CT04 | Fora do expediente | Emitir antes das 7h ou depois das 17h | Emissão recusada com mensagem | | | |
| CT05 | Backend desligado | Parar o backend e emitir | "Não foi possível emitir a senha agora. Procure a recepção." | | | |
| CT06 | Sem dados pessoais (LGPD) | Observar o totem | Nenhum campo pede nome, CPF ou telefone | | | |

## Atendente (AA)

| ID | Caso de teste | Passos | Resultado esperado | Resultado | Data | Observação |
|----|---------------|--------|--------------------|-----------|------|------------|
| CT07 | Login válido | Entrar com usuário cadastrado | Acessa a tela do atendente | | | |
| CT08 | Login inválido | Senha errada | "Login ou senha inválidos" | | | |
| CT09 | Ordem de chamada | Emitir SG, SE, SP, SP; chamar 4 vezes (finalizando cada uma) | Alterna SP e SE/SG (ex.: SP, SE, SP, SG), com SE antes de SG | | | |
| CT10 | Fila vazia | Chamar sem senhas na fila | Aviso de que não há senhas | | | |
| CT11 | Uma senha por vez | Chamar com uma senha ainda em aberto | Recusa: concluir o atendimento atual | | | |
| CT12 | Iniciar e finalizar | Chamar → Iniciar → Encerrar | Estados CHAMADA → EM_ATENDIMENTO → ATENDIDA | | | |
| CT13 | Chamar novamente | Chamar → Chamar novamente | Estado CHAMADA_NOVAMENTE; painel mostra "última chamada" | | | |
| CT14 | Não compareceu | Chamar → Chamar novamente → Não compareceu | Estado NÃO_COMPARECEU; senha sai do painel | | | |
| CT15 | Concorrência | Dois atendentes (navegadores diferentes) chamam ao mesmo tempo | Cada um recebe uma senha diferente | | | |
| CT16 | Guichê | Trocar o guichê e chamar | Painel mostra o guichê escolhido | | | |

## Painel

| ID | Caso de teste | Passos | Resultado esperado | Resultado | Data | Observação |
|----|---------------|--------|--------------------|-----------|------|------------|
| CT17 | Últimas 5 chamadas | Fazer 6 chamadas | Painel mostra só as 5 mais recentes | | | |
| CT18 | Não mostra a próxima | Observar o painel com senhas na fila | Nenhuma senha AGUARDANDO aparece | | | |
| CT19 | Áudio da chamada | Abrir o painel, clicar na página uma vez e fazer uma chamada | Anuncia "Senha {tipo} {número}, guichê {n}" | | | |
| CT20 | Áudio da última chamada | Chamar novamente | Anuncia "Última chamada. Senha …" | | | |
| CT21 | Sem repetição | Deixar o painel aberto alguns minutos | Cada chamada é anunciada uma vez só | | | |
| CT22 | Backend cai | Parar o backend com o painel aberto | Mantém as chamadas e mostra aviso de reconexão | | | |
| CT23 | Backend volta | Religar o backend | Aviso some e o painel volta a atualizar sozinho | | | |

## Gestor

| ID | Caso de teste | Passos | Resultado esperado | Resultado | Data | Observação |
|----|---------------|--------|--------------------|-----------|------|------------|
| CT24 | Acesso restrito | Entrar como atendente comum | Não vê a tela do gestor | | | |
| CT25 | Cadastrar atendente | Cadastrar com senha de 8+ caracteres | Atendente criado e consegue fazer login | | | |
| CT26 | Senha curta | Cadastrar com senha de menos de 8 caracteres | Cadastro recusado | | | |
| CT27 | Login duplicado | Cadastrar login que já existe | Cadastro recusado | | | |
| CT28 | Relatório diário | Abrir relatório de hoje | Totais, por prioridade, TM, detalhado e auditoria batem com o que foi feito | | | |
| CT29 | Relatório mensal | Abrir relatório do mês | Soma de todos os dias do mês | | | |
| CT30 | Encerrar expediente | Após as 17h, "Descartar fila restante" | Senhas AGUARDANDO viram NÃO_COMPARECEU; atendimentos em curso continuam | | | |

## Acessibilidade

| ID | Caso de teste | Passos | Resultado esperado | Resultado | Data | Observação |
|----|---------------|--------|--------------------|-----------|------|------------|
| CT31 | Navegação por teclado | Usar só Tab, Enter e espaço | Todas as ações são possíveis e o foco é visível | | | |
| CT32 | Leitor de tela | Usar NVDA ou Narrador do Windows | Títulos, botões e avisos são lidos | | | |

## Bugs e melhorias encontrados

| ID | Descrição | Severidade | Status | Data |
|----|-----------|------------|--------|------|
| B01 | | | | |
