# Diagrama de sequência — chamar próxima senha (com concorrência)

Dois atendentes clicam em "Chamar próxima senha" ao mesmo tempo. A trava na linha de `controle_fila` faz o banco atender um de cada vez, então cada um recebe uma senha diferente.

```mermaid
sequenceDiagram
    actor A1 as Atendente 1 (guichê 1)
    actor A2 as Atendente 2 (guichê 2)
    participant API as Backend (AS)
    participant DB as MySQL
    participant P as Painel

    par ao mesmo tempo
        A1->>API: POST /api/atendimento/chamar {guiche: 1}
    and
        A2->>API: POST /api/atendimento/chamar {guiche: 2}
    end

    API->>DB: BEGIN; SELECT controle_fila FOR UPDATE (A1)
    DB-->>API: trava obtida, proxima_sp = true
    API->>DB: SELECT controle_fila FOR UPDATE (A2)
    Note over DB: A2 espera a trava ser liberada

    API->>DB: busca 1ª senha SP AGUARDANDO
    API->>DB: UPDATE senha → CHAMADA (guichê 1)
    API->>DB: UPDATE proxima_sp = false; COMMIT
    API-->>A1: 200 261126-SP001, guichê 1

    DB-->>API: trava obtida por A2, proxima_sp = false
    API->>DB: busca 1ª senha SE (ou SG) AGUARDANDO
    API->>DB: UPDATE senha → CHAMADA (guichê 2)
    API->>DB: UPDATE proxima_sp = true; COMMIT
    API-->>A2: 200 261126-SE001, guichê 2

    loop a cada 3 s
        P->>API: GET /api/painel
        API-->>P: 5 últimas chamadas
    end
    P->>P: anuncia por áudio as chamadas novas
```

## Casos alternativos

- **Fila vazia:** a API responde `204` e a tela do atendente informa que não há senhas.
- **Atendente já tem senha em aberto:** `409` "Conclua o atendimento atual antes de chamar outra senha".
- **Fora do expediente:** `403`.
- **Erro no meio da transação:** `ROLLBACK`; nenhuma senha muda de estado.
