# Plano e relatório de testes

**Ambiente:** backend (`cd backend && npm start`), frontend (`cd frontend && npm run dev`), MySQL 8.0, navegador Chrome/Edge.
**Como preencher:** em cada caso, anote o resultado (✅ passou / ❌ falhou / ⚠️ parcial / ⏸ não executado), a data e uma observação. Bugs encontrados vão para a tabela no final.

**Execução:** 26/11/2026, das 14h47 às 14h52, ambiente local. Casos de API executados por script (dois atendentes de teste: `teste1_ee1797` e `teste2_ee1797`); casos de tela executados no navegador. Reexecução de CT04, CT30 e CT32 às 15h53, com o relógio do backend simulado às 20h53 (fuso UTC+2) para testar o fim do expediente.

## Totem (AC)

| ID | Caso de teste | Passos | Resultado esperado | Resultado | Data | Observação |
|----|---------------|--------|--------------------|-----------|------|------------|
| CT01 | Emitir senha SP | Clicar em "Prioritária (SP)" | Mostra senha `YYMMDD-SP001` (ou próxima sequência) | ✅ | 26/11/2026 | Emitida `261126-SP005`, estado AGUARDANDO. |
| CT02 | Emitir senha SE e SG | Clicar em cada botão | Número com o tipo correto e sequência própria de cada tipo | ✅ | 26/11/2026 | `SE005`; `SG003` e `SG004` em seguida. Cada tipo tem sua sequência. |
| CT03 | Formato do número | Conferir a senha emitida | Formato `YYMMDD-PPSQ` com a data de hoje | ✅ | 26/11/2026 | Todas com prefixo `261126-`. Tipo inválido é recusado (400). |
| CT04 | Fora do expediente | Emitir antes das 7h ou depois das 17h | Emissão recusada com mensagem | ✅ | 26/11/2026 | Com o relógio às 20h53: emitir → 403 e o totem mostra "Fora do expediente (07h–17h)"; chamar → 403. |
| CT05 | Backend desligado | Parar o backend e emitir | "Não foi possível emitir a senha agora. Procure a recepção." | ✅ | 26/11/2026 | Mensagem exibida como alerta. |
| CT06 | Sem dados pessoais (LGPD) | Observar o totem | Nenhum campo pede nome, CPF ou telefone | ✅ | 26/11/2026 | O totem tem só os 3 botões de tipo, nenhum campo de texto. |

## Atendente (AA)

| ID | Caso de teste | Passos | Resultado esperado | Resultado | Data | Observação |
|----|---------------|--------|--------------------|-----------|------|------------|
| CT07 | Login válido | Entrar com usuário cadastrado | Acessa a tela do atendente | ✅ | 26/11/2026 | Login 200, perfil ATENDENTE. |
| CT08 | Login inválido | Senha errada | "Login ou senha inválidos" | ✅ | 26/11/2026 | 401 com a mensagem esperada. |
| CT09 | Ordem de chamada | Emitir SG, SE, SP, SP; chamar 4 vezes (finalizando cada uma) | Alterna SP e SE/SG (ex.: SP, SE, SP, SG), com SE antes de SG | ✅ | 26/11/2026 | Fila SP, SP, SE, SG, SG → chamadas SP → SE → SP → SG → SG. |
| CT10 | Fila vazia | Chamar sem senhas na fila | Aviso de que não há senhas | ✅ | 26/11/2026 | API responde 204 (fila vazia). Mensagem na tela não conferida. |
| CT11 | Uma senha por vez | Chamar com uma senha ainda em aberto | Recusa: concluir o atendimento atual | ✅ | 26/11/2026 | 409 "Conclua o atendimento atual antes de chamar outra senha". |
| CT12 | Iniciar e finalizar | Chamar → Iniciar → Encerrar | Estados CHAMADA → EM_ATENDIMENTO → ATENDIDA | ✅ | 26/11/2026 | Finalizar de novo é recusado (409). Outro atendente não consegue mexer na senha (409). |
| CT13 | Chamar novamente | Chamar → Chamar novamente | Estado CHAMADA_NOVAMENTE; painel mostra "última chamada" | ✅ | 26/11/2026 | Senha volta ao topo do painel marcada como repetida. |
| CT14 | Não compareceu | Chamar → Chamar novamente → Não compareceu | Estado NÃO_COMPARECEU; senha sai do painel | ✅ | 26/11/2026 | |
| CT15 | Concorrência | Dois atendentes (navegadores diferentes) chamam ao mesmo tempo | Cada um recebe uma senha diferente | ✅ | 26/11/2026 | 10 rodadas com 2 chamadas simultâneas: 20 senhas distintas, nenhuma repetida. |
| CT16 | Guichê | Trocar o guichê e chamar | Painel mostra o guichê escolhido | ✅ | 26/11/2026 | Na 1ª execução o topo do painel mostrou outra senha chamada no mesmo segundo (B01). Após a correção, 10 rodadas com chamadas seguidas: a última chamada sempre no topo com o guichê certo. |

## Painel

| ID | Caso de teste | Passos | Resultado esperado | Resultado | Data | Observação |
|----|---------------|--------|--------------------|-----------|------|------------|
| CT17 | Últimas 5 chamadas | Fazer 6 chamadas | Painel mostra só as 5 mais recentes | ✅ | 26/11/2026 | 5 itens após 27 chamadas. |
| CT18 | Não mostra a próxima | Observar o painel com senhas na fila | Nenhuma senha AGUARDANDO aparece | ✅ | 26/11/2026 | Com 3 senhas aguardando, nenhuma apareceu. |
| CT19 | Áudio da chamada | Abrir o painel, clicar uma vez na tela e fazer uma chamada | Anuncia "Senha {tipo} {número}, guichê {n}" | ✅ | 26/11/2026 | Falou "Senha prioritária 14, guichê 3" (pt-BR). Retestado no PC com a voz Maria (pt-BR) instalada: som ouvido. |
| CT20 | Áudio da última chamada | Chamar novamente | Anuncia "Última chamada. Senha …" | ✅ | 26/11/2026 | "Última chamada. Senha prioritária 14, guichê 3". |
| CT21 | Sem repetição | Deixar o painel aberto alguns minutos | Cada chamada é anunciada uma vez só | ✅ | 26/11/2026 | 2 chamadas → 2 anúncios em 20 s de observação. |
| CT22 | Backend cai | Parar o backend com o painel aberto | Mantém as chamadas e mostra aviso de reconexão | ✅ | 26/11/2026 | Aviso "Sistema temporariamente indisponível. Tentando reconectar…" com o horário dos dados. Recarregando a página, as 5 chamadas continuam. |
| CT23 | Backend volta | Religar o backend | Aviso some e o painel volta a atualizar sozinho | ✅ | 26/11/2026 | Voltou sozinho em poucos segundos. |
| CT33 | Ligar e desligar o som | Ativar som → chamar → Desativar som → chamar → Ativar som → chamar | Só a 1ª e a 3ª chamadas são anunciadas | ✅ | 26/11/2026 | Anunciou SG026 e SG028; SG027 (som desligado) ficou em silêncio. |
| CT34 | Som ligado ao abrir | Abrir o painel pelo endereço e fazer uma chamada sem clicar no botão de som | Painel abre com "Desativar som"; aviso para clicar na tela até o primeiro clique; chamada anunciada | ⚠️ | 26/11/2026 | Abriu com som ligado e anunciou "Senha exames 38, guichê 4" sem clicar no botão. Desligar o som e recarregar manteve desligado. O aviso de clique não pôde ser visto no navegador de teste; conferir no Chrome. |
| CT35 | Hora do computador alterada | Fazer chamadas, atrasar o relógio do PC e chamar outra senha | A nova chamada vai para o topo do painel e é anunciada | ✅ | 26/11/2026 | Com chamadas gravadas até 16h02 e o relógio às 15h38, SG037 foi para o topo e foi anunciada, inclusive a "Última chamada". Antes da correção ela não aparecia (B04). |

## Gestor

| ID | Caso de teste | Passos | Resultado esperado | Resultado | Data | Observação |
|----|---------------|--------|--------------------|-----------|------|------------|
| CT24 | Acesso restrito | Entrar como atendente comum | Não vê a tela do gestor | ✅ | 26/11/2026 | Na 1ª execução, abrindo `#gestor` no endereço a tela do gestor aparecia (B02). Após a correção, mostra só "Esta tela é restrita ao perfil gestor."; o botão não aparece e a API recusa (403). |
| CT25 | Cadastrar atendente | Cadastrar com senha de 8+ caracteres | Atendente criado e consegue fazer login | ✅ | 26/11/2026 | Cadastro 201 e login 200. |
| CT26 | Senha curta | Cadastrar com senha de menos de 8 caracteres | Cadastro recusado | ✅ | 26/11/2026 | 400 "Dados inválidos (senha mínima de 8 caracteres)". |
| CT27 | Login duplicado | Cadastrar login que já existe | Cadastro recusado | ✅ | 26/11/2026 | 409 "Registro duplicado". |
| CT28 | Relatório diário | Abrir relatório de hoje | Totais, por prioridade, TM, detalhado e auditoria batem com o que foi feito | ✅ | 26/11/2026 | 45 emitidas = 45 no detalhado; 38 atendidas; soma por tipo confere; auditoria com as chamadas dos atendentes de teste. TM 0 s porque o script inicia e finaliza no mesmo segundo. |
| CT29 | Relatório mensal | Abrir relatório do mês | Soma de todos os dias do mês | ✅ | 26/11/2026 | Novembro/2026: só um dia com senhas, todas do mês. Data inválida é recusada (400). |
| CT30 | Encerrar expediente | Após as 17h, "Descartar fila restante" | Senhas AGUARDANDO viram NÃO_COMPARECEU; atendimentos em curso continuam | ✅ | 26/11/2026 | Às 14h47 nada foi descartado (correto antes das 17h). Com o relógio às 20h53, as 3 senhas aguardando (SG030–SG032) viraram NÃO_COMPARECEU logo que o backend subiu; o botão retornou 0 restantes; a senha EM_ATENDIMENTO (SG029) foi finalizada normalmente. |

## Acessibilidade

| ID | Caso de teste | Passos | Resultado esperado | Resultado | Data | Observação |
|----|---------------|--------|--------------------|-----------|------|------------|
| CT31 | Navegação por teclado | Usar só Tab, Enter e espaço | Todas as ações são possíveis e o foco é visível | ✅ | 26/11/2026 | Senha emitida só com Tab + Enter; foco com contorno verde de 2,4 px. |
| CT32 | Leitor de tela | Usar NVDA ou Narrador do Windows | Títulos, botões e avisos são lidos | ✅ | 26/11/2026 | Testado com o Narrador do Windows: títulos, botões e avisos das telas foram lidos. Verificação automática também ok: página em pt-BR, títulos H1/H2, botões e campos com nome ou rótulo, avisos com role=alert/status e painel com aria-live. |

## Desempenho

Emitir e chamar senha: máximo de 22 ms e média de 16 ms em 10 medições (meta: menos de 1 s).

## Bugs e melhorias encontrados

| ID | Descrição | Severidade | Status | Data |
|----|-----------|------------|--------|------|
| M01 | Botão "Ativar som" do painel considerado inútil. | Baixa | Revisto: removido (`bee4f02`), mas sem ele o navegador bloqueia o áudio; voltou como botão liga/desliga (`56fa1ad`) | 26/11/2026 |
| B03 | Sem som no painel: o Windows só tinha voz em inglês (Zira). | Média | Resolvido: instalada a voz Português (Brasil) no Windows | 26/11/2026 |
| B04 | Depois de atrasar a hora do PC, chamadas novas não apareciam no painel nem eram anunciadas: as chamadas antigas ficavam "no futuro" e ocupavam o topo. | Alta | Corrigido: o painel ordena por número de ordem da chamada, não pelo relógio (`03aaf61`) | 26/11/2026 |
| B01 | Duas chamadas no mesmo segundo ficam com o mesmo horário; o painel pode destacar a senha errada como a mais recente. | Baixa | Corrigido: horários de chamada com milissegundos (retestado no CT16) | 26/11/2026 |
| B02 | Atendente comum consegue abrir a tela do gestor digitando `#gestor` no endereço (os dados são bloqueados pela API). | Baixa | Corrigido: a tela mostra aviso de acesso restrito (retestado no CT24) | 26/11/2026 |
