# DoseDay — Direcao Geral de Design da Tela Unica

**Data:** 2026-05-23  
**Status:** documento de direcao visual e produto. Nao e prompt de execucao.  
**Base visual aprovada:** Figma Make v7, export local em `/Users/leofrancaia/Downloads/High-Fidelity App Design Directions (1)`  
**Referencia tecnica curta:** `docs/handoff/HANDOFF-figma-make-home-v7.md`

Este documento consolida a direcao visual da futura tela unica do DoseDay. Ele deve orientar Codex, Claude Code e Claude Cowork quando retomarmos a implementacao.

---

## 1. Decisao central

A tela principal do DoseDay deve parecer uma **memoria organizada do tratamento**, nao um dashboard, prontuario, diario de sintomas ou app motivacional.

O usuario nao entra para "preencher um sistema". Ele entra para lembrar o que aconteceu, registrar o minimo necessario e sair com a sensacao de que o tratamento esta organizado.

**Frase de norte:**

> Seu tratamento esta organizado ate aqui.

Essa frase nao e so headline. Ela define a promessa da tela.

---

## 2. O que esta direcao resolve

| Problema anterior | Direcao nova |
|---|---|
| Home parecia tracker generico | Home vira memoria do tratamento |
| Muitos cards desconectados | Layout linear com separadores finos |
| Check-in parecia obrigacao diaria | Captura vira acao contextual, sem cobranca |
| Proxima dose podia assumir 7 dias | Estado seguro: `A definir` ate protocolo informado |
| IA parecia protagonista | Memoria e protagonista; IA e veiculo no Pro |
| Relatorio parecia medico-first | Consulta vira memoria do que lembrar, paciente-first |
| Sintomas viravam formulario | Observacoes viram memoria contextual |

---

## 3. Personalidade visual

A tela deve ser:

| Deve parecer | Nao deve parecer |
|---|---|
| iOS premium | dashboard tecnico |
| calma | app motivacional |
| adulta | wellness fofo |
| clinica sem hospital | prontuario medico |
| densa sem poluir | pilha de cards |
| pessoal | sistema operacional de clinica |
| confiavel | chatbot de IA |

O design deve ser sofisticado pela precisao: espacamento, contraste, tipografia, ritmo e ausencia de excesso.

---

## 4. Estrutura da tela unica

A ordem aprovada da tela e (atualizada 2026-05-25 apos pivot Prompt 37 — acoes rapidas removidas, captura migrada para sheets dedicados acessiveis via `+` no header de cada bloco interativo):

| Ordem | Bloco | Funcao |
|---|---|---|
| 1 | Topo de memoria | Estado humano da tela: tratamento organizado ate aqui |
| 2 | Proxima dose | Mostrar proxima dose apenas quando houver protocolo; senao `A definir`. Header tem `+` que abre sheet de anotar dose; body navega para editar protocolo |
| 3 | Peso atual | Dado forte, number-first. Header tem `+` que abre sheet de anotar peso; body navega para historico |
| 4 | Notas recentes | Timeline simples dos registros relevantes. Header tem `+` que abre sheet de anotar nota; body read-only |
| 5 | Sintomas | Memoria contextual, sem causalidade. Header tem `+` que abre sheet de anotar sintoma; body read-only |
| 6 | Para a consulta | Itens que o usuario quer lembrar — read-only nesta fase (sem `+`) |
| 7 | Custos registrados | Memoria financeira pessoal, exibida somente quando houver custo registrado. Header tem `+` que abre sheet de anotar custo |
| 8 | Disclaimer | Limite claro: memoria, nao orientacao medica |

Essa ordem e importante: primeiro o usuario entende o estado, depois revisa memoria. Captura entra via sheets dedicados acessiveis em cada bloco — nao mais via barra fixa no topo.

---

## 5. Linguagem visual

### 5.1 Fundo

A direcao aprovada usa um graphite escuro proximo de `#0B1017`. Ele e um pouco mais claro e menos duro que preto puro.

Decisao pendente antes da implementacao:

| Opcao | Implicacao |
|---|---|
| Adaptar v7 aos tokens atuais (`#050B12`, `#0E1620`, `#1B2433`) | Menor mudanca no design system atual |
| Promover graphite v7 como ajuste de token | Mais fiel ao Figma Make aprovado |

Nao usar preto puro `#000` nem fundo claro.

### 5.2 Separadores

Separadores finos sao parte central da direcao. Eles substituem a necessidade de cards grandes.

Regra: separar blocos com linhas discretas e espacamento generoso, nao com caixas em tudo.

### 5.3 Cards

Cards existem apenas onde ajudam a interacao:

| Pode usar card | Nao usar card |
|---|---|
| Acoes rapidas | Toda secao da tela |
| Observacao pontual | Timeline inteira como card pesado |
| Estado interativo pequeno | Cards brancos ou muito brilhantes |

A tela nao pode virar uma pilha de cartoes.

### 5.4 Cor

Vital Mint continua raro. Aparece em **dois papeis controlados**:

1. **CTA primario** — icone `Anotar dose` (gradient sutil no topo do botao + cor do icone `Plus`).
2. **Indicador de estado atual** (decidida 2026-05-25 13:05) — ponto final do sparkline de peso na Home v7 clean usa `mintSoft` (`#A3E6D2`) pra marcar visualmente "este e o valor atual". O ponto inicial usa cor neutra (`semanticMuted`).

Regra: o mint nao decora. Ele sinaliza **acao** ou **estado atual**. Nao usar em labels, dividers, eyebrows ou ornamento. Nao expandir alem desses dois papeis sem decisao explicita.

---

## 6. Tipografia e hierarquia

A hierarquia deve ser feita por tamanho, peso e contraste, nao por enfeite.

| Elemento | Direcao |
|---|---|
| Titulo | Grande, leve, calmo, duas linhas no maximo |
| Labels de secao | Uppercase pequeno, tracking moderado, peso semibold |
| Peso | Numero grande, simples, sem grafico obrigatorio |
| Timeline | Texto curto, legivel, sem jargao |
| Disclaimer | Pequeno, centralizado, discreto mas legivel |

Nao usar fonte serifada. Nao usar display font. A implementacao deve usar system/SF Pro.

---

## 7. Entries dedicados via sheet

**Decisao 2026-05-25 (Prompt 37):** As 3 acoes rapidas fixas no topo foram removidas. Captura migra para sheets nativos iOS (Form Sheet com detents) acessiveis via `+` discreto no header de cada bloco interativo. Sheet sobe pela metade da tela e mantem o dashboard visivel atras — preserva o contexto da memoria do tratamento. Captura permanece convencional e estruturada (sem IA).

| Entry | Sheet | Acessivel via | Detents |
|---|---|---|---|
| `Anotar dose` | `/dose/registrar` | `+` em PROXIMA DOSE | `fitToContents` |
| `Anotar peso` | `/peso/registrar` | `+` em PESO | `fitToContents` |
| `Anotar sintoma` | `/diario/anotar-sintoma` | `+` em SINTOMAS | `[0.5, 1.0]` |
| `Anotar nota` | `/diario/anotar-memoria` | `+` em NOTAS RECENTES | `[0.5, 1.0]` |
| `Anotar custo` | `/diario/anotar-custo` | `+` em CUSTOS REGISTRADOS | `[0.5, 1.0]` |

Sheets sao Form Sheet nativos do Expo Router 6+ (`presentation: 'formSheet'`). Cada sheet tem drag handle nativo + botao `X` superior, suporta swipe-down para dismiss. Touch targets ≥ 44pt.

Direcao visual de cada sheet:

- header conciso (titulo "Anotar X" + `X` para fechar);
- conteudo em textarea/input livre, sem chips engessados;
- CTA primario "Anotar" em Vital Mint (`AuthButton variant='primary'`);
- footer fino com hairline divider;
- sem glass em nenhuma parte do sheet (glass continua restrito a navegacao);
- chips de "Frequentes" apenas no sheet de Sintoma, derivados do proprio historico do usuario (top 5 ultimos 30 dias). Quando 0 sintomas registrados, secao de chips fica oculta.

**Bloco "PARA A CONSULTA":** mantido read-only nesta fase. Sheet dedicado entra em PR futuro.

**Bloco "CUSTOS REGISTRADOS":** continua condicional (`purchases.count > 0`). O `+` no header so existe quando o bloco esta visivel.

---

## 8. Proxima dose

Regra absoluta: DoseDay nao inventa protocolo.

Enquanto o usuario nao informou frequencia:

| Elemento | Copy |
|---|---|
| Label | `Proxima dose` |
| Valor | `A definir` |
| Helper | `Defina seu intervalo para calcular a proxima dose.` |

Nao mostrar data, contagem regressiva, atraso ou aderencia baseado em suposicao.

Quando houver protocolo confirmado, a tela pode mostrar a proxima dose calculada de forma transparente.

---

## 9. Memoria recente

A timeline e o eixo mais importante da tela apos o topo.

Ela deve mostrar fatos curtos:

- dose registrada;
- peso atualizado;
- observacao salva;
- memoria adicionada;
- item para consulta.

Ela nao deve interpretar clinicamente o dado.
Ela tambem nao deve usar meta-registros vagos como "Registro adicionado ao historico". Cada item precisa dizer o que aconteceu.

Exemplo bom:

> Dose de 0.5mg administrada.

> Peso registrado (84.2 kg).

> Anotacao adicionada para a consulta.

Exemplo ruim:

> Dose de 0.5mg causou nausea no dia seguinte.

> Registro adicionado ao historico.

---

## 10. Observacoes e sintomas

Observacoes sao memoria, nao diagnostico.

Copy aprovada:

> Nausea matinal foi salva na sua memoria do tratamento.

Isso e seguro porque apenas espelha o que foi salvo. Nao diz que e esperado, nao diz que foi causado pela dose, nao sugere conduta.

Nao usar:

- "acompanhar nos proximos dias";
- "pos-dose";
- "nas ultimas 24h";
- "efeito esperado";
- "vale procurar medico";
- "alerta";
- qualquer causalidade dose-sintoma.

---

## 11. Para a consulta

Esta secao nao e checklist medico. E memoria do usuario.

Copy segura:

- `Anotar duvidas para a consulta`;
- `Comentar desconforto no estomago`;
- `Exames recentes`;
- `Perguntas que quero lembrar`.

Nao usar:

- `Discutir ajuste de dose`;
- `Pedir prescricao`;
- `Avaliar conduta`;
- `Recomendacao`;
- `Orientacao`.

---

## 12. Custos registrados

Custos sao memoria financeira pessoal.

Label aprovado:

> Custos registrados

Evitar `Investimento`, porque pode soar como justificativa comercial do tratamento.

Custos nao devem entrar automaticamente em material para medico. Eles pertencem ao usuario.

Regra de exibicao na Home: o bloco `Custos registrados` aparece apenas quando o usuario ja registrou pelo menos um custo. Em cold start, nao mostrar um bloco vazio de custos. Isso evita transformar uma memoria opcional em cobranca ou tarefa pendente.

---

## 13. Disclaimer

Disclaimer aprovado:

> Nada aqui e orientacao medica. E uma memoria organizada do seu tratamento.

Ele deve ficar no rodape da tela ou proximo de superficies inteligentes. Deve ser discreto, mas legivel.

---

## 14. Relacao com Free e Pro

Esta direcao visual funciona para Free e Pro, mas a profundidade muda.

| Bloco | Free | Pro |
|---|---|---|
| Acoes rapidas | Sim | Sim |
| Proxima dose | Sim, se protocolo informado | Sim, com memoria contextual |
| Peso | Sim | Sim |
| Memoria recente | Historico basico | Memoria inteligente quando houver dados |
| Observacoes | Espelho factual | Agrupamento factual sem causalidade |
| Para consulta | Lista manual | Preparacao inteligente para consulta |
| Custos | Basico ou gated conforme produto | Completo |

Free nao deve parecer alimentado por IA recorrente. Pro pode transformar dados em memoria inteligente, sempre com guardrails.

---

## 15. O que nao fazer

- Nao transformar a Home em dashboard de metricas.
- Nao voltar para tabs dentro da tela unica.
- Nao adicionar tab bar dentro do scroll. Se houver navegacao, ela pertence ao shell do app ou a outra superficie; dentro da tela unica, usar links contextuais como `Ver historico` quando necessario.
- Nao adicionar check-in diario.
- Nao usar emoji mood tracker.
- Nao usar graficos grandes por padrao.
- Nao usar glass em conteudo.
- Nao usar cards brancos ou muito brilhantes.
- Nao usar tom coach, celebratorio ou motivacional.
- Nao usar linguagem de conduta medica.
- Nao usar trial/estudo/SURPASS/SURMOUNT/STEP.
- Nao assumir frequencia, preco, estoque, efeito, janela biologica ou causalidade.

---

## 16. Como implementar depois da pausa

A implementacao deve ser feita em etapas, nao como substituicao cega da Home.

Sequencia recomendada:

1. Criar plano em `docs/superpowers/plans/`.
2. Mapear Home atual e dependencias de dados.
3. Escolher estrategia de token: adaptar v7 aos tokens atuais ou promover graphite v7.
4. Criar rota/flag experimental para a tela unica.
5. Implementar componentes pequenos:
   - `HomeHeaderMemory`
   - `HomeQuickActions`
   - `NextDoseMemorySection`
   - `WeightMemorySection`
   - `RecentMemoryTimeline`
   - `ObservationMemoryCard`
   - `ConsultationMemorySection`
   - `CostMemorySection`
   - `MedicalDisclaimer`
6. Validar com simulador e screenshots reais.
7. Rodar type-check, lint e `/impeccable critique`.
8. So depois decidir substituicao da Home atual.

---

## 17. Fonte visual

Arquivo exportado do Figma Make:

`/Users/leofrancaia/Downloads/High-Fidelity App Design Directions (1)/src/app/DoseDayHome.tsx`

Esse arquivo deve ser tratado como referencia visual e estrutural, nao como codigo reutilizavel diretamente. Ele e React web com Tailwind; o app real e Expo React Native.
