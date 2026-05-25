# Handoff — Figma Make Home v7

**Data:** 2026-05-23  
**Fonte local:** `/Users/leofrancaia/Downloads/High-Fidelity App Design Directions (1)`  
**Arquivo principal:** `src/app/DoseDayHome.tsx`  
**Status:** referencia visual aprovada como base. Nao e implementacao React Native.

## Veredito

A versao v7 do Figma Make e a melhor direcao visual ate agora para a futura tela unica do DoseDay.

Ela acerta a tese principal: DoseDay como memoria organizada do tratamento, nao dashboard clinico, nao diario de sintomas, nao app motivacional.

## O que aproveitar

| Area | Decisao |
|---|---|
| Estrutura | Manter a ordem: topo, acoes rapidas, proxima dose, peso, memoria recente, observacoes, consulta, custos, disclaimer. |
| Visual | Manter fundo graphite escuro, separadores finos, densidade calma, poucos cards. |
| Acoes rapidas | Manter `Anotar dose`, `Anotar peso`, `Adicionar memoria` logo abaixo do topo. |
| Proxima dose | Manter fallback seguro: `A definir` + `Defina seu intervalo para calcular a proxima dose.` |
| Peso | Manter numero grande, sem grafico pesado. |
| Memoria recente | Manter timeline simples como eixo central da tela. |
| Consulta | Manter como memoria do que lembrar, sem orientacao medica. |
| Custos | Exibir `Custos registrados` somente quando houver pelo menos um custo registrado. |
| Disclaimer | Manter no rodape: `Nada aqui e orientacao medica. E uma memoria organizada do seu tratamento.` |

## O que nao portar literalmente

| Artefato Figma Make | Motivo |
|---|---|
| Tailwind classes | App real e Expo React Native, sem Tailwind. Converter para `StyleSheet`/tokens. |
| `lucide-react` web | Usar biblioteca de icones ja adotada no app ou equivalente React Native. |
| Hex solto em toda linha | Mapear para tokens de `docs/DESIGN.md` antes de implementar. |
| `font-light` excessivo | Em RN, verificar legibilidade em iPhone real/simulador. |
| `Activity` para `Anotar peso` | Aceitavel como placeholder, mas nao ideal. Preferir icone de peso/scale/chart simples. |
| Gradiente de 1px no botao principal | Pode virar detalhe sutil em RN, mas nao e obrigatorio. Vital Mint deve continuar raro. |

## Token mapping sugerido

| Figma Make | Papel | Token DoseDay sugerido |
|---|---|---|
| `#0B1017` | fundo base da tela | `bg-base` ou variante nova `bg-graphite` se aprovada |
| `#121923` | quick action surface | `bg-elevated` |
| `#1C2330` | separador | `border/subtle` derivado de `bg-surface` |
| `#A3E6D2` | mint suave do icone primario | `brand` com opacidade baixa ou `brand-soft` |
| `slate-200/300/400/500` | texto hierarquico | `text-primary`, `text-secondary`, `text-tertiary` |

Observacao: `docs/DESIGN.md` ainda define `bg-base: #050B12`, `bg-elevated: #0E1620`, `bg-surface: #1B2433`. A v7 usa um graphite um pouco mais claro. Antes de implementar, decidir se o app adota o graphite v7 como ajuste de token ou se adapta o layout v7 aos tokens atuais.

## Componentes React Native sugeridos

| Componente | Responsabilidade |
|---|---|
| `HomeSingleScrollScreen` | Orquestra a tela, safe area, scroll e spacing vertical. |
| `HomeHeaderMemory` | Titulo e data/contexto atual. |
| `HomeQuickActions` | Tres acoes primarias: dose, peso, memoria. |
| `NextDoseMemorySection` | Estado da proxima dose, incluindo fallback `A definir`. |
| `WeightMemorySection` | Peso atual e delta desde o inicio. |
| `RecentMemoryTimeline` | Ultimos registros relevantes. |
| `ObservationMemoryCard` | Observacao/sintoma salvo sem causalidade. |
| `ConsultationMemorySection` | Itens para lembrar na consulta. |
| `CostMemorySection` | Custos registrados. |
| `MedicalDisclaimer` | Disclaimer fixo da memoria. |

## Copy canonica da v7

| Elemento | Copy |
|---|---|
| Titulo | `Seu tratamento esta organizado ate aqui.` |
| Data exemplo | `Sexta-feira, 12 de Maio` |
| Acao 1 | `Anotar dose` |
| Acao 2 | `Anotar peso` |
| Acao 3 | `Adicionar memoria` |
| Proxima dose label | `Proxima dose` |
| Proxima dose vazio | `A definir` |
| Proxima dose helper | `Defina seu intervalo para calcular a proxima dose.` |
| Peso label | `Peso atual` |
| Memoria label | `Memoria recente` |
| Timeline item dose | `Dose de 0.5mg administrada.` |
| Timeline item peso | `Peso registrado (84.2 kg).` |
| Timeline item nota | `Anotacao adicionada.` |
| Observacoes label | `Observacoes` |
| Observacao exemplo | `Nausea matinal foi salva na sua memoria do tratamento.` |
| Consulta label | `Para a consulta` |
| Consulta item 1 | `Anotar duvidas para a consulta` |
| Consulta item 2 | `Comentar desconforto no estomago` |
| Custos label | `Custos registrados` |
| Custos exemplo | `R$ 950 em tratamento neste ciclo.` |
| Disclaimer | `Nada aqui e orientacao medica. E uma memoria organizada do seu tratamento.` |

Ao implementar em arquivos reais, usar acentos normalmente conforme o sistema de i18n/locales do app. Este handoff esta em ASCII por padrao de edicao.

## Guardrails

- Nao adicionar tab bar dentro do scroll.
- Nao portar qualquer tab bar interna do Figma Make. Se aparecer entre secoes, tratar como artefato e remover.
- Nao adicionar check-in diario.
- Nao usar `24h`, `pos-dose`, `janela`, `pico`, ou causalidade dose-sintoma.
- Nao usar `ajuste de dose`, `prescricao`, `recomendacao`, `orientacao` como tarefa/CTA.
- Nao transformar observacoes em formulario de sintomas.
- Nao voltar para cards brancos ou contrastes que dominem a tela.
- Nao usar glass em conteudo.
- Nao usar meta-registro vago como `Registro adicionado ao historico`; cada item da timeline deve dizer o fato especifico.

## Follow-ups fechados em 2026-05-24

| Ponto | Decisao |
|---|---|
| Tab bar `Hoje / Historico / Ajustes` vista em screenshot | Artefato visual. Nao portar para RN dentro do scroll. |
| Timeline vaga | Substituir por evento especifico: dose, peso, observacao, memoria ou consulta. |
| Label `PESO` vs `Peso atual` | `PESO` pode ser usado visualmente se o contexto e o delta deixarem claro que e o peso atual. Em i18n/semantica interna, usar `Peso atual`. |
| Custos na Home | Bloco condicional. Mostrar apenas se houver custo registrado; nao mostrar empty state de custo no cold start. |

## Proxima tarefa recomendada

Antes de codar UI final, fazer uma PR pequena de preparacao:

1. Criar plano em `docs/superpowers/plans/`.
2. Mapear componentes atuais da Home que serao substituidos/reusados.
3. Confirmar tokens que serao usados (`#0B1017` vs `#050B12`).
4. Implementar atras de flag ou rota experimental, sem mexer na Home atual de producao.
5. Validar com simulador, screenshots reais e `/impeccable critique`.
