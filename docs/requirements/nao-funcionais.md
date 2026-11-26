# Requisitos não funcionais — detalhamento

## LGPD (Lei 13.709/2018)

- **Minimização de dados:** o cliente (AC) é anônimo. O totem não pede nome, CPF, telefone nem qualquer dado pessoal. A senha contém só data, tipo e sequência.
- **Painel público:** mostra apenas o número da senha e o guichê, nunca dados de pessoas.
- **Dados de atendentes:** o sistema guarda só nome, login, senha (em hash bcrypt, nunca em texto) e perfil. Esses dados têm finalidade de controle de acesso e auditoria.
- **Acesso restrito:** relatórios e auditoria, que mostram o nome do atendente, só são acessíveis ao perfil GESTOR.
- **Segurança da informação:** token JWT com validade, HTTPS disponível, segredo e senha do banco fora do código (`.env`, que não vai para o repositório).
- **Senha prioritária:** o tipo SP indica atendimento prioritário (idosos, gestantes, PcD etc.), mas o sistema não registra o motivo da prioridade, evitando guardar dado sensível de saúde.

## Acessibilidade

- **Áudio:** cada chamada é anunciada em voz no painel (Web Speech API, idioma pt-BR), com prioridade, número e guichê. A segunda chamada é anunciada como "Última chamada".
- **Leitores de tela:** página com `lang="pt-BR"`, seções com título (`aria-labelledby`), lista do painel com `aria-live="polite"`, mensagens de erro com `role="alert"` e confirmações com `role="status"`.
- **Teclado:** todos os botões e campos são elementos nativos (`button`, `input`, `select`) e têm foco visível (`:focus-visible`).
- **Leitura:** senha em destaque e fonte grande no painel e no totem, bom contraste entre texto e fundo.
- **Menu de telas:** o botão da tela atual é indicado com `aria-pressed`.

## Recuperação de falhas

| Falha | Comportamento |
|-------|---------------|
| Banco de dados fora do ar | A API responde 503 "Serviço temporariamente indisponível" em vez de travar. Ao voltar, tudo funciona sem reiniciar. |
| Backend fora do ar | As telas mostram "Sistema temporariamente indisponível. Tentando reconectar…" e o horário dos últimos dados. A busca é repetida automaticamente. |
| Painel sem conexão | Continua exibindo as últimas 5 chamadas (mantidas em memória e no `localStorage`), mesmo se a página for recarregada. |
| Totem sem conexão | Mostra "Não foi possível emitir a senha agora. Procure a recepção." |
| Requisição travada | Tempo limite de 8 s no frontend. |
| Erro no meio de uma emissão ou chamada | A transação é desfeita (rollback). Nenhuma senha fica pela metade ou duplicada. |
| Reinício do backend | Ao iniciar, o backend descarta a fila de dias anteriores e retoma. Os estados das senhas ficam no banco, então nada se perde. |
| Sessão expirada | O atendente volta para a tela de login. |

**Recuperação de desastre (recomendação):** backup diário do banco com `mysqldump nassautickets > backup.sql` e restauração com `mysql nassautickets < backup.sql`.

## Métricas de desempenho

- **TM (tempo médio de atendimento):** média de `fim_atendimento − inicio_atendimento` das senhas ATENDIDAS, geral e por tipo, nos relatórios diário e mensal.
- **Volume:** senhas emitidas e atendidas por dia, por mês e por prioridade.
- **Abandono:** senhas NÃO_COMPARECEU (ausentes e descartadas no fim do expediente).
- **Por atendente/guichê:** a auditoria mostra quem chamou, em qual guichê e os horários de cada etapa.
- **Meta de resposta:** chamar ou emitir uma senha em menos de 1 s.
