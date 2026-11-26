# Diagrama de casos de uso

```mermaid
flowchart LR
    AC([Cliente - AC])
    AA([Atendente - AA])
    G([Gestor])
    AS([Sistema - AS])

    subgraph nassauTickets
        UC1((Emitir senha))
        UC2((Acompanhar painel))
        UC3((Fazer login))
        UC4((Chamar próxima senha))
        UC5((Chamar novamente))
        UC6((Iniciar atendimento))
        UC7((Finalizar atendimento))
        UC8((Marcar não compareceu))
        UC9((Cadastrar atendente))
        UC10((Emitir relatórios))
        UC11((Encerrar expediente))
        UC12((Anunciar chamada por áudio))
        UC13((Descartar fila no fim do expediente))
    end

    AC --> UC1
    AC --> UC2
    AA --> UC3
    AA --> UC4
    AA --> UC5
    AA --> UC6
    AA --> UC7
    AA --> UC8
    G -. herda .-> AA
    G --> UC9
    G --> UC10
    G --> UC11
    AS --> UC12
    AS --> UC13
    UC11 -. include .-> UC13
    UC4 -. include .-> UC12
    UC5 -. include .-> UC12
```

## Descrição dos casos de uso

| Caso de uso | Ator | Pré-condição | Fluxo principal | Exceções |
|-------------|------|--------------|-----------------|----------|
| Emitir senha | AC | Dentro do expediente (7h–17h) | Cliente escolhe SP, SE ou SG; sistema gera o número `YYMMDD-PPSQ` e coloca a senha na fila (AGUARDANDO). | Fora do expediente: emissão recusada. Sem conexão: "Procure a recepção". |
| Acompanhar painel | AC | — | Painel mostra as 5 últimas chamadas e o guichê, sem mostrar a próxima. | Sem conexão: mantém as últimas chamadas e avisa. |
| Fazer login | AA | Atendente cadastrado | Informa login e senha; sistema devolve a sessão. | Login ou senha inválidos. |
| Chamar próxima senha | AA | Logado, guichê escolhido, sem atendimento em aberto | Sistema escolhe a próxima senha pela RN01, marca CHAMADA e o painel anuncia. | Fila vazia; atendimento em aberto (409); fora do expediente. |
| Chamar novamente | AA | Senha em CHAMADA | Senha passa para CHAMADA_NOVAMENTE; painel anuncia "Última chamada". | — |
| Iniciar atendimento | AA | Senha em CHAMADA ou CHAMADA_NOVAMENTE | Senha passa para EM_ATENDIMENTO e o início é registrado. | — |
| Finalizar atendimento | AA | Senha EM_ATENDIMENTO | Senha passa para ATENDIDA e o fim é registrado. | — |
| Marcar não compareceu | AA | Senha em CHAMADA_NOVAMENTE | Senha passa para NÃO_COMPARECEU (motivo AUSENTE) e sai do painel. | — |
| Cadastrar atendente | Gestor | Logado como gestor | Informa nome, login, senha (mín. 8 caracteres) e perfil. | Login já existe; dados inválidos. |
| Emitir relatórios | Gestor | Logado como gestor | Escolhe diário ou mensal e a data; vê totais, por prioridade, TM, detalhado e auditoria. | Data inválida. |
| Encerrar expediente | Gestor | Logado como gestor | Senhas AGUARDANDO após as 17h (ou de dias anteriores) são descartadas. | — |
