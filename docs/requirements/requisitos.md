# Requisitos — nassauTickets

Sistema de controle de atendimento por senhas de um laboratório de análises clínicas.

## Agentes

| Sigla | Agente | Papel no sistema |
|-------|--------|------------------|
| AS | Agente Sistema | Backend (API + banco). Emite e numera senhas, controla a fila, a ordem de chamada, os estados e os relatórios. |
| AA | Agente Atendente | Funcionário no guichê. Faz login, chama senhas, inicia e finaliza atendimentos. O **gestor** é um atendente com perfil adicional. |
| AC | Agente Cliente | Pessoa atendida. Retira a senha no totem, de forma anônima, e acompanha o painel. |

## Requisitos funcionais

| Código | Requisito | Agente | Tela |
|--------|-----------|--------|------|
| RF01 | Emitir senha SP (Prioritária), SE (Retirada de exames) ou SG (Geral) pelo totem, sem identificar o cliente. | AC | Totem |
| RF02 | Numerar as senhas no formato `YYMMDD-PPSQ` (data, tipo e sequência de 3 dígitos). A sequência é por tipo e reinicia a cada dia. Ex.: `261126-SP001`. | AS | — |
| RF03 | Chamar a próxima senha obedecendo à ordem de prioridade (RN01). | AA | Atendente |
| RF04 | Iniciar e finalizar o atendimento da senha chamada. | AA | Atendente |
| RF05 | Chamar novamente uma senha cujo cliente não apareceu. O painel anuncia "Última chamada". | AA | Atendente / Painel |
| RF06 | Marcar como NÃO_COMPARECEU a senha chamada duas vezes sem o cliente aparecer. | AA | Atendente |
| RF07 | Exibir no painel as 5 últimas senhas chamadas, com o guichê, **sem mostrar a próxima senha da fila**. | AS | Painel |
| RF08 | Anunciar por áudio cada chamada no painel: prioridade, número e guichê. | AS | Painel |
| RF09 | Controlar os estados da senha (ver máquina de estados em `docs/models/uml`). | AS | — |
| RF10 | Autenticar atendentes por login e senha. O perfil GESTOR acessa cadastros, relatórios e o encerramento do expediente. | AA | Login |
| RF11 | Cadastrar atendentes (somente gestor). | AA (gestor) | Gestor |
| RF12 | Emitir relatórios diário e mensal com: total emitido e atendido, quantidade por prioridade, relatório detalhado (número, tipo, emissão, atendimento, guichê), tempo médio (TM) e auditoria (quem chamou, quando e em qual guichê). | AA (gestor) | Gestor |
| RF13 | Descartar, no fim do expediente, as senhas que ficaram na fila. | AS / gestor | Gestor |

## Requisitos não funcionais

| Código | Requisito | Como o sistema atende |
|--------|-----------|-----------------------|
| RNF01 | Segurança | Login com JWT (expira em 10 h), senhas guardadas com hash bcrypt, rotas do gestor protegidas por perfil e suporte a HTTPS (`SSL_KEY`/`SSL_CERT`). |
| RNF02 | Concorrência | Emissão e chamada rodam em transação com trava (`SELECT … FOR UPDATE`) na tabela `controle_fila`. Dois atendentes nunca recebem a mesma senha, e um atendente só chama outra senha depois de concluir a atual. |
| RNF03 | Disponibilidade e recuperação | Ver `nao-funcionais.md`, seção Recuperação de falhas. |
| RNF04 | Desempenho | Chamada e emissão respondem em menos de 1 s em operação normal. Índice `idx_fila (data, tipo, estado, seq)` para buscar a próxima senha. |
| RNF05 | Auditoria | Cada senha guarda horário de emissão, 1ª e 2ª chamada, início e fim do atendimento, guichê e atendente. |
| RNF06 | LGPD | Ver `nao-funcionais.md`, seção LGPD. |
| RNF07 | Acessibilidade | Ver `nao-funcionais.md`, seção Acessibilidade. |
| RNF08 | Usabilidade | Telas simples, botões grandes no totem e mensagens de erro em português. |

## Regras de negócio

| Código | Regra |
|--------|-------|
| RN01 | Ordem de chamada: **[SP] → [SE\|SG] → [SP] → [SE\|SG]**. Depois de uma SP, chama-se SE (se houver) ou SG; depois de uma SE/SG, volta para SP. Se a fila do tipo da vez estiver vazia, chama-se o próximo tipo que tiver senha. |
| RN02 | Dentro de cada tipo, a ordem é de chegada (menor sequência primeiro). |
| RN03 | Qualquer guichê atende qualquer tipo de senha. |
| RN04 | Expediente das 7h às 17h. Fora dele, o totem não emite senha e o atendente não chama. |
| RN05 | No fim do expediente, as senhas ainda AGUARDANDO são descartadas (NÃO_COMPARECEU, motivo `DESCARTADA_FIM_EXPEDIENTE`). Atendimentos em curso são concluídos normalmente. |
| RN06 | A senha chamada duas vezes sem o cliente aparecer é considerada abandonada (NÃO_COMPARECEU, motivo `AUSENTE`) e sai do painel. |
| RN07 | Um atendente atende uma senha por vez. |
| RN08 | Tempo médio de referência da especificação: SG 5 min (±3), SP 15 min (±5), SE 1 min (95%) ou 5 min (5%). O sistema mede o TM real (início → fim do atendimento) nos relatórios. |
| RN09 | Cerca de 5% das senhas emitidas não são atendidas (referência da especificação). |
