# Requisitos iniciais — nassauTickets

## Requisitos funcionais
- RF01 Emitir senha SP, SG ou SE pelo totem, sem identificação do cliente.
- RF02 Numerar senhas no formato YYMMDD-PPSQ, com sequência por tipo e reinício diário.
- RF03 Chamar a próxima senha obedecendo a prioridade.
- RF04 Iniciar e finalizar o atendimento no guichê.
- RF05 Chamar novamente (com áudio "Última chamada"); após duas chamadas sem comparecimento, marcar NÃO_COMPARECEU.
- RF06 Exibir no painel as 5 últimas senhas chamadas, sem mostrar a próxima.
- RF07 Gerir estados: EMITIDA, AGUARDANDO, CHAMADA, CHAMADA_NOVAMENTE, EM_ATENDIMENTO, ATENDIDA, NÃO_COMPARECEU.
- RF08 Login do atendente e perfil adicional de gestor (cadastros e relatórios).
- RF09 Relatórios diário e mensal: emitidas, atendidas, por prioridade, detalhado, tempo médio e auditoria.
- RF10 Áudio na chamada com prioridade, sequência e guichê.

## Requisitos não funcionais
- RNF01 Segurança: autenticação, senhas com hash, HTTPS.
- RNF02 Disponibilidade: comportamento definido do frontend e do painel se backend ou banco falharem.
- RNF03 Auditoria: registrar todas as chamadas e atendimentos.
- RNF04 Desempenho: resposta de chamada abaixo de 1 s.
- RNF05 Concorrência: dois atendentes não podem receber a mesma senha.
- RNF06 LGPD: não coletar dados pessoais do cliente no totem.
- RNF07 Acessibilidade: contraste, navegação por teclado, áudio e leitores de tela.

## Regras de negócio
- RN01 Ordem: SP → (SE | SG) → SP → (SE | SG), com SE antes de SG. Se uma fila estiver vazia, segue a prioridade restante.
- RN02 Qualquer guichê atende qualquer tipo de senha.
- RN03 Expediente das 7h às 17h; ao encerrar, senhas restantes são descartadas e atendimentos em curso são concluídos.
- RN04 Tempo médio: SG 5 min (±3), SP 15 min (±5), SE 1 min (95%) ou 5 min (5%).
- RN05 Cerca de 5% das senhas emitidas não são atendidas.
- RN06 Após 2 chamadas sem comparecimento, a senha é considerada abandonada.
