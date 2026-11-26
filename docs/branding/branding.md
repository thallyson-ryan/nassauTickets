# Branding — nassauTickets

![Logo nassauTickets](logo.svg)

## Nome

**nassauTickets** — "Nassau" pela instituição (UNINASSAU) e "Tickets" pelas senhas de atendimento. Escrito sempre junto, com "T" maiúsculo.

## Logo

Uma senha de papel (com o picote de destacar) marcada com um sinal de "concluído", representando o atendimento organizado. Arquivo vetorial: [`logo.svg`](logo.svg).

## Paleta de cores

As mesmas cores usadas no sistema (`frontend/src/styles.css`).

| Cor | Hex | Uso |
|-----|-----|-----|
| Azul institucional | `#12355b` | Título, botões principais, senha em destaque no painel |
| Verde atendimento | `#1f7a5a` | Destaques, foco do teclado, confirmação |
| Fundo | `#f5f7f6` | Fundo das telas |
| Texto | `#1b1f23` | Texto corrido |
| Branco | `#ffffff` | Cartões, tabelas, texto sobre o azul |

### Contraste (WCAG 2.1)

| Combinação | Contraste | Nível |
|------------|-----------|-------|
| Azul sobre branco | 12,5 : 1 | AAA |
| Azul sobre fundo | 11,6 : 1 | AAA |
| Texto sobre fundo | 15,4 : 1 | AAA |
| Verde sobre branco | 5,3 : 1 | AA |

Todas as combinações passam no mínimo AA (4,5 : 1) para texto normal.

## Tipografia

Fonte do sistema operacional (`system-ui`: Segoe UI no Windows, Roboto no Android, San Francisco no macOS). Carrega rápido, é legível e não depende de internet.

| Elemento | Tamanho |
|----------|---------|
| Senha em destaque no painel | 1,8 rem |
| Demais senhas do painel | 1,3 rem |
| Botões grandes (totem, atendente) | 1,2 rem |
| Texto | 1 rem |

## Tom de voz

Mensagens curtas, em português, no imperativo e sem termos técnicos: "Retire sua senha", "Aguarde ser chamado no painel", "Procure a recepção".
